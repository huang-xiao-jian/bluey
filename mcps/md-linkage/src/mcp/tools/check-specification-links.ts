import { isAbsolute } from "node:path";
import { z } from "zod";
import type { MarkdownLinkageCapabilities } from "../../application/markdown-linkage";
import {
  isConcreteDocumentPath,
  LinkCheckDelegation,
  LinkCheckMode,
} from "../../core/model/link-check-delegation";
import { LinkCheckScopeIssueType } from "../../core/model/link-check-scope";
import { DeadReason, ResolvedSpecificationLinkStatus } from "../../core/model/resolved-specification-link";
import { SpecificationLinkType } from "../../core/model/specification-link";

const RootSchema = z
  .string()
  .min(1)
  .refine(isAbsolute, "Project root must be an absolute path");
const DocumentPathSchema = z
  .string()
  .refine(isConcreteDocumentPath, "Document path must be a concrete path");

export const CheckSpecificationLinksInputSchema = z
  .object({
    root: RootSchema.describe("Explicit absolute project boundary for this check."),
    files: z
      .array(DocumentPathSchema)
      .min(1)
      .describe("One or more concrete document paths."),
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
  files: z.array(z.string()),
  mode: z.nativeEnum(LinkCheckMode),
});

const ScopeSchema = z.object({
  files: z.array(z.string()),
  issues: z.array(
    z.object({
      path: z.string(),
      resolvedPath: z.string(),
      issueType: z.nativeEnum(LinkCheckScopeIssueType),
    }),
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
  capabilities: MarkdownLinkageCapabilities,
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
      );
      const report = LinkCheckReportOutputSchema.parse(
        await capabilities.checkSpecificationLinks(delegation),
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
