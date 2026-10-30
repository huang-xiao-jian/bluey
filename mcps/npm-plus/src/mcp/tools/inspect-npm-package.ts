import { z } from "zod";
import { InspectDelegation } from "../../core/model/inspect-delegation";
import { DirectDependencyKind } from "../../core/model/inspect-target-quality";
import { isUnsupportedVersionRange } from "../../core/target/package-version-identifier-interpreter";
import type { InspectNpmPackageQualityWorkflow } from "../../core/workflow/inspect-npm-package-quality-workflow-scheduler";

const NonBlankStringSchema = z
  .string()
  .refine((value) => value.trim().length > 0, "Value must not be blank");

export const InspectNpmPackageInputSchema = z
  .object({
    packageName: NonBlankStringSchema.describe("The npm package name."),
    versionIdentifier: NonBlankStringSchema.refine(
      (value) => !isUnsupportedVersionRange(value),
      "Version ranges are not supported",
    )
      .optional()
      .describe("An exact version or npm dist-tag. Defaults to latest."),
  })
  .strict();

const InspectDelegationSchema = z.object({
  packageName: z.string(),
  versionIdentifier: z.string().optional(),
});

const InspectTargetSchema = z.object({
  packageName: z.string(),
  exactVersion: z.string(),
  tag: z.string().optional(),
});

const DirectDependencyDeclarationSchema = z.object({
  packageName: z.string(),
  kind: z.nativeEnum(DirectDependencyKind),
  declaredRange: z.string(),
  bundled: z.boolean(),
  peerOptional: z.boolean().optional(),
});

const DependencyScaleQualitySchema = z.object({
  directDependencyDeclarations: z.array(DirectDependencyDeclarationSchema),
  directDependencyCounts: z.object({
    runtimeCount: z.number().int().nonnegative(),
    optionalCount: z.number().int().nonnegative(),
    peerCount: z.number().int().nonnegative(),
    bundledCount: z.number().int().nonnegative(),
  }),
});

const InspectTargetQualitySchema = z.object({
  dependencyScale: DependencyScaleQualitySchema.optional(),
  exceptions: z.array(z.object({ name: z.string(), message: z.string() })),
});

export const InspectResultOutputSchema = z.object({
  delegation: InspectDelegationSchema,
  target: InspectTargetSchema,
  quality: InspectTargetQualitySchema,
});

export type InspectNpmPackageInput = z.infer<
  typeof InspectNpmPackageInputSchema
>;

export function createInspectNpmPackageTool(
  scheduler: InspectNpmPackageQualityWorkflow,
) {
  return {
    name: "inspect_npm_package",
    title: "Inspect npm package quality",
    description:
      "Resolve an npm package to an exact version and return objective quality facts.",
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
      destructiveHint: false,
    },
    inputSchema: InspectNpmPackageInputSchema,
    outputSchema: InspectResultOutputSchema,
    async callback(input: InspectNpmPackageInput) {
      const parsed = InspectNpmPackageInputSchema.parse(input);
      const delegation = new InspectDelegation(
        parsed.packageName,
        parsed.versionIdentifier,
      );
      const result = InspectResultOutputSchema.parse({
        delegation,
        ...(await scheduler.run(delegation)),
      });
      return {
        result,
        summary: [
          `Target: ${result.target.packageName}@${result.target.exactVersion}`,
          `dependency scale: ${result.quality.dependencyScale ? "available" : "unavailable"}`,
          `quality exceptions: ${result.quality.exceptions.length}`,
        ].join("; "),
      };
    },
  };
}
