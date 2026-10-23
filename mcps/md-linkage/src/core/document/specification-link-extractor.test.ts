import { describe, expect, it } from "vitest";
import { SpecificationDocument } from "../model/specification-document";
import { SpecificationLinkType } from "../model/specification-link";
import { SpecificationLinkExtractor } from "./specification-link-extractor";

describe("SpecificationLinkExtractor", () => {
  it("extracts supported links in authored order and preserves their material", () => {
    const content = [
      "[Guide](docs/guide.md)",
      "[Current section](#current-section)",
      "[Target section](docs/guide.md#target-section)",
    ].join("\n");

    const links = new SpecificationLinkExtractor().extract(
      new SpecificationDocument("spec.md", content),
    );

    expect(links).toEqual([
      {
        type: SpecificationLinkType.LocalFile,
        text: "[Guide](docs/guide.md)",
        name: "Guide",
        path: "docs/guide.md",
      },
      {
        type: SpecificationLinkType.InFileAnchor,
        text: "[Current section](#current-section)",
        name: "Current section",
        anchor: "current-section",
      },
      {
        type: SpecificationLinkType.CrossFileAnchor,
        text: "[Target section](docs/guide.md#target-section)",
        name: "Target section",
        path: "docs/guide.md",
        anchor: "target-section",
      },
    ]);
  });

  it("ignores images, external destinations, and empty destinations", () => {
    const content = [
      "![Image](image.png)",
      "[Web](https://example.com)",
      "[Mail](mailto:user@example.com)",
      "[Protocol relative](//example.com/path)",
      "[Empty]()",
    ].join("\n");

    expect(
      new SpecificationLinkExtractor().extract(
        new SpecificationDocument("spec.md", content),
      ),
    ).toEqual([]);
  });
});
