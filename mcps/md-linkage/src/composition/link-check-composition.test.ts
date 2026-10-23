import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LinkCheckDelegation } from "../core/model/link-check-delegation";
import { LinkCheckWorkflowScheduler } from "../core/workflow/link-check-workflow-scheduler";
import { createLinkCheckWorkflowScheduler } from "./link-check-composition";

const projectRoot = join(
  import.meta.dirname,
  "../../tests/e2e/__fixtures__/project",
);

describe("createLinkCheckWorkflowScheduler", () => {
  it("creates a composed link check workflow scheduler", async () => {
    const scheduler = createLinkCheckWorkflowScheduler();

    const report = await scheduler.run(
      new LinkCheckDelegation(projectRoot, ["clean.md"]),
    );

    expect(scheduler).toBeInstanceOf(LinkCheckWorkflowScheduler);
    expect(report.delegation.root).toBe(projectRoot);
    expect(report.scope.files).toEqual(["clean.md"]);
    expect(report.deadLinks).toEqual([]);
  });
});
