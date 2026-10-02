import { z } from "zod";
import { echo } from "../../core/echo";

export const EchoInputSchema = z.object({
  text: z.string().min(1).max(4_000).describe("Text to return unchanged."),
});

export const EchoOutputSchema = z.object({
  text: z.string().describe("Text returned unchanged."),
});

export type EchoInput = z.infer<typeof EchoInputSchema>;

export const EchoTool = {
  name: "echo",
  title: "Echo text",
  description: "reflect supplied text unchanged.",
  inputSchema: EchoInputSchema,
  outputSchema: EchoOutputSchema,
  // the callback is an adapter to the core functionality
  // it can be used to isolate parameters when mcp input differs from core functionality parameters
  // it can be used to post-process the output from the core functionality for better mcp compatibility
  async callback({ text }: EchoInput) {
    return echo(text);
  },
};
