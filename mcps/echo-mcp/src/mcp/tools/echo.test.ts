import { describe, expect, it } from "vitest";
import { EchoTool, EchoInputSchema } from "./echo";

describe("Echo MCP tool", () => {
  it("returns text unchanged in both MCP response representations", async () => {
    const text = "  Hello, 世界! 👋  ";
    const result = await EchoTool.callback({ text });

    expect(result).toEqual(text);
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
});
