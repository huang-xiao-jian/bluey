import { describe, expect, it } from "vitest";

describe("verifyToolchain", () => {
  it("accepts the exact Node.js and pnpm versions", async () => {
    const { verifyToolchain } = await import("./verify-toolchain.mjs");

    expect(() =>
      verifyToolchain({
        actualNodeVersion: "26.8.2",
        actualUserAgent: "pnpm/12.4.2 npm/? node/v26.8.2 darwin arm64",
        expectedNodeVersion: "26.8.2",
        expectedPackageManager: "pnpm@12.4.2",
      }),
    ).not.toThrow();
  });

  it("rejects a different Node.js version", async () => {
    const { verifyToolchain } = await import("./verify-toolchain.mjs");

    expect(() =>
      verifyToolchain({
        actualNodeVersion: "25.6.0",
        actualUserAgent: "pnpm/12.4.2 npm/? node/v25.6.0 darwin arm64",
        expectedNodeVersion: "26.8.2",
        expectedPackageManager: "pnpm@12.4.2",
      }),
    ).toThrow("Node.js 26.8.2 is required; received 25.6.0");
  });

  it("rejects a different pnpm version", async () => {
    const { verifyToolchain } = await import("./verify-toolchain.mjs");

    expect(() =>
      verifyToolchain({
        actualNodeVersion: "26.8.2",
        actualUserAgent: "pnpm/12.3.0 npm/? node/v26.8.2 darwin arm64",
        expectedNodeVersion: "26.8.2",
        expectedPackageManager: "pnpm@12.4.2",
      }),
    ).toThrow("pnpm 12.4.2 is required; received 12.3.0");
  });

  it("rejects installation through another package manager", async () => {
    const { verifyToolchain } = await import("./verify-toolchain.mjs");

    expect(() =>
      verifyToolchain({
        actualNodeVersion: "26.8.2",
        actualUserAgent: "npm/11.9.0 node/v26.8.2 darwin arm64",
        expectedNodeVersion: "26.8.2",
        expectedPackageManager: "pnpm@12.4.2",
      }),
    ).toThrow("pnpm 12.4.2 is required; received npm/11.9.0");
  });

  it("reports a missing package-manager user agent", async () => {
    const { verifyToolchain } = await import("./verify-toolchain.mjs");

    expect(() =>
      verifyToolchain({
        actualNodeVersion: "26.8.2",
        actualUserAgent: "",
        expectedNodeVersion: "26.8.2",
        expectedPackageManager: "pnpm@12.4.2",
      }),
    ).toThrow("pnpm 12.4.2 is required; received unknown");
  });

  it("rejects a mise Node.js pin that differs from .nvmrc", async () => {
    const { verifyToolchain } = await import("./verify-toolchain.mjs");

    expect(() =>
      verifyToolchain({
        actualNodeVersion: "26.8.2",
        actualUserAgent: "pnpm/12.4.2 npm/? node/v26.8.2 darwin arm64",
        expectedNodeVersion: "26.8.2",
        expectedPackageManager: "pnpm@12.4.2",
        miseNodeVersion: "26.9.0",
        misePnpmVersion: "12.4.2",
      }),
    ).toThrow("mise Node.js 26.9.0 does not match .nvmrc 26.8.2");
  });

  it("rejects a mise pnpm pin that differs from packageManager", async () => {
    const { verifyToolchain } = await import("./verify-toolchain.mjs");

    expect(() =>
      verifyToolchain({
        actualNodeVersion: "26.8.2",
        actualUserAgent: "pnpm/12.4.2 npm/? node/v26.8.2 darwin arm64",
        expectedNodeVersion: "26.8.2",
        expectedPackageManager: "pnpm@12.4.2",
        miseNodeVersion: "26.8.2",
        misePnpmVersion: "12.3.0",
      }),
    ).toThrow("mise pnpm 12.3.0 does not match packageManager 12.4.2");
  });
});
