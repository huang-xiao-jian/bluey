import { describe, expect, it } from "vitest";
import { LinkCheckWorkflowScheduler } from "../core/workflow/link-check-workflow-scheduler";
import { createApplicationContainer } from "./create-application-container";

describe("createApplicationContainer", () => {
  it("resolves the complete link-check workflow", () => {
    const container = createApplicationContainer();

    expect(container.get(LinkCheckWorkflowScheduler)).toBeInstanceOf(
      LinkCheckWorkflowScheduler,
    );
  });
});
