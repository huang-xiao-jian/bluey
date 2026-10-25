import { describe, expect, it } from "vitest";
import { EchoTool, EchoInputSchema, EchoOutputSchema } from "./echo";

describe("Echo MCP tool", () => {
  it("returns validated result data and a text summary", async () => {
    const text = "  Hello, 世界! 👋  ";
    const result = await EchoTool.callback({ text });

    expect(result).toEqual({
      result: { text },
      summary: text,
    });
  });

  it("accepts text at the maximum supported length", () => {
    const text = "a".repeat(4_000);

    expect(() => EchoInputSchema.parse({ text })).not.toThrow();
  });

  it("rejects empty text", () => {
    expect(() => EchoInputSchema.parse({ text: "" })).toThrow();
  });

  it("rejects text longer than the maximum supported length", () => {
    const text = "a".repeat(4_001);

    expect(() => EchoInputSchema.parse({ text })).toThrow();
  });

  it("rejects output that does not contain text", () => {
    expect(() => EchoOutputSchema.parse({})).toThrow();
  });
});
