import { z } from "zod";
import { echo } from "../capability/echo";

export const EchoInputSchema = z.object({
  text: z.string().min(1).max(4_000).describe("Text to return unchanged."),
});

export const EchoOutputSchema = z.object({
  text: z.string().describe("Text returned unchanged."),
});

export type EchoInput = z.infer<typeof EchoInputSchema>;

export const EchoTool = {
  async callback({ text }: EchoInput) {
    return echo(text);
  },
};
