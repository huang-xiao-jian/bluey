import { describe, expect, it } from "vitest";
import {
  InspectTargetException,
  InspectTargetExceptionCode,
} from "../errors/inspect-target-exception";
import {
  ExactVersionNotFound,
  PackageNotFound,
  RegistryRequestError,
  TagNotFound,
  TagUnresolvable,
} from "../errors/target-determination-errors";
import { InspectDelegation } from "../model/inspect-delegation";
import { InspectTargetFailureExplainer } from "./inspect-target-failure-explainer";

describe("InspectTargetFailureExplainer", () => {
  const explainer = new InspectTargetFailureExplainer();

  it.each([
    {
      error: new PackageNotFound("example-package"),
      code: InspectTargetExceptionCode.PackageNotFound,
      message:
        "npm Registry 中未找到 package“example-package”，请确认名称是否正确以及该 package 是否已发布。",
    },
    {
      error: new ExactVersionNotFound("example-package", "3.0.0"),
      code: InspectTargetExceptionCode.ExactVersionNotFound,
      message:
        "npm package“example-package”没有发布版本“3.0.0”，请确认精确版本号是否正确。",
    },
    {
      error: new TagNotFound("example-package", "next"),
      code: InspectTargetExceptionCode.TagNotFound,
      message:
        "npm package“example-package”没有“next”tag，请确认 tag 是否正确。",
    },
    {
      error: new TagUnresolvable("example-package", "next", "3.0.0"),
      code: InspectTargetExceptionCode.TagUnresolvable,
      message:
        "npm package“example-package”的“next”tag 未指向已发布版本，请尝试其他 tag 或精确版本号。",
    },
    {
      error: new RegistryRequestError("registry unavailable"),
      code: InspectTargetExceptionCode.RegistryError,
      message: "registry unavailable",
    },
  ])("should explain $code", ({ error, code, message }) => {
    expect(
      explainer.explain(
        error,
        new InspectDelegation(
          "example-package",
          code === InspectTargetExceptionCode.ExactVersionNotFound
            ? "3.0.0"
            : "next",
        ),
      ),
    ).toEqual(new InspectTargetException(code, message));
  });

  it("should preserve an existing inspection exception", () => {
    const exception = new InspectTargetException(
      InspectTargetExceptionCode.PackageNotFound,
      "already explained",
    );

    expect(
      explainer.explain(exception, new InspectDelegation("example-package")),
    ).toBe(exception);
  });
});
