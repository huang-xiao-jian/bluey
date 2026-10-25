import { isAbsolute } from "node:path";
import { z } from "zod";
import {
  isLinkCheckInput,
  LinkCheckDelegation,
  LinkCheckMode,
} from "../../core/model/link-check-delegation";
import {
  LinkCheckScopeIssueSubjectType,
  LinkCheckScopeIssueType,
} from "../../core/model/link-check-scope";
import {
  DeadReason,
  ResolvedSpecificationLinkStatus,
} from "../../core/model/resolved-specification-link";
import { SpecificationLinkType } from "../../core/model/specification-link";
import type { LinkCheckWorkflowScheduler } from "../../core/workflow/link-check-workflow-scheduler";

const RootSchema = z
  .string()
  .min(1)
  .refine(isAbsolute, "Project root must be an absolute path");
const FileInputSchema = z
  .string()
  .refine(isLinkCheckInput, "File input must be a non-empty string");

export const CheckSpecificationLinksInputSchema = z
  .object({
    root: RootSchema.describe("Explicit absolute project boundary for this check."),
    files: z
      .array(FileInputSchema)
      .min(1)
      .describe("One or more file paths, directory paths, or glob patterns."),
    mode: z
      .nativeEnum(LinkCheckMode)
      .default(LinkCheckMode.Shallow)
      .describe("Whether to check only starting files or follow Markdown links."),
  })
  .strict();

const SpecificationLinkSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(SpecificationLinkType.LocalFile),
    text: z.string(),
    name: z.string(),
    path: z.string(),
  }),
  z.object({
    type: z.literal(SpecificationLinkType.InFileAnchor),
    text: z.string(),
    name: z.string(),
    anchor: z.string(),
  }),
  z.object({
    type: z.literal(SpecificationLinkType.CrossFileAnchor),
    text: z.string(),
    name: z.string(),
    path: z.string(),
    anchor: z.string(),
  }),
]);

const DelegationSchema = z.object({
  root: z.string(),
  base: z.string(),
  files: z.array(z.string()),
  mode: z.nativeEnum(LinkCheckMode),
});

const PathScopeIssueSchema = z.object({
  subjectType: z.literal(LinkCheckScopeIssueSubjectType.Path),
  path: z.string(),
  resolvedPath: z.string(),
  issueType: z.union([
    z.literal(LinkCheckScopeIssueType.PathOutsideProjectRoot),
    z.literal(LinkCheckScopeIssueType.PathNotFound),
    z.literal(LinkCheckScopeIssueType.FileNotMarkdown),
    z.literal(LinkCheckScopeIssueType.DirectoryContainsNoMarkdown),
  ]),
});

const GlobPatternScopeIssueSchema = z.object({
  subjectType: z.literal(LinkCheckScopeIssueSubjectType.GlobPattern),
  base: z.string(),
  pattern: z.string(),
  issueType: z.union([
    z.literal(LinkCheckScopeIssueType.GlobPatternInvalid),
    z.literal(LinkCheckScopeIssueType.GlobPatternNotMatched),
    z.literal(LinkCheckScopeIssueType.GlobPatternMatchedNoMarkdown),
  ]),
});

const GlobMatchScopeIssueSchema = z.object({
  subjectType: z.literal(LinkCheckScopeIssueSubjectType.GlobMatch),
  base: z.string(),
  pattern: z.string(),
  matchedPath: z.string(),
  issueType: z.literal(LinkCheckScopeIssueType.PathOutsideProjectRoot),
});

const ScopeSchema = z.object({
  files: z.array(z.string()),
  issues: z.array(
    z.discriminatedUnion("subjectType", [
      PathScopeIssueSchema,
      GlobPatternScopeIssueSchema,
      GlobMatchScopeIssueSchema,
    ]),
  ),
});

const DeadLinkSchema = z.object({
  status: z.literal(ResolvedSpecificationLinkStatus.Dead),
  location: z.object({ root: z.string(), filePath: z.string() }),
  link: SpecificationLinkSchema,
  target: z.object({
    filePath: z.string(),
    anchorId: z.string().optional(),
    anchorName: z.string().optional(),
  }),
  reason: z.nativeEnum(DeadReason),
});

export const LinkCheckReportOutputSchema = z.object({
  delegation: DelegationSchema,
  scope: ScopeSchema,
  deadLinks: z.array(DeadLinkSchema),
});

export type CheckSpecificationLinksInput = z.infer<
  typeof CheckSpecificationLinksInputSchema
>;
export type CheckSpecificationLinksOutput = z.infer<
  typeof LinkCheckReportOutputSchema
>;

export function createCheckSpecificationLinksTool(
  scheduler: LinkCheckWorkflowScheduler,
) {
  return {
    name: "check_specification_links",
    title: "Check specification links",
    description:
      "Read Markdown specification documents and report invalid local links without changing files.",
    inputSchema: CheckSpecificationLinksInputSchema,
    outputSchema: LinkCheckReportOutputSchema,
    async callback(input: CheckSpecificationLinksInput) {
      const parsed = CheckSpecificationLinksInputSchema.parse(input);
      const delegation = new LinkCheckDelegation(
        parsed.root,
        parsed.files,
        parsed.mode,
        parsed.root,
      );
      const report = LinkCheckReportOutputSchema.parse(
        await scheduler.run(delegation),
      );
      return {
        report,
        summary: [
          `Documents: ${report.scope.files.length}`,
          `scope issues: ${report.scope.issues.length}`,
          `dead links: ${report.deadLinks.length}`,
        ].join("; "),
      };
    },
  };
}
