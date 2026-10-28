import type { InspectResult } from "../inspect-result";

export class InspectReportFormatter {
  public formatHuman(result: InspectResult): string {
    const tag = result.target.tag ? ` (tag: ${result.target.tag})` : "";
    const counts = result.quality.dependencyScale?.directDependencyCounts;
    const lines = [
      `Target: ${result.target.packageName}@${result.target.exactVersion}${tag}`,
    ];

    if (counts) {
      lines.push(
        `Runtime dependencies: ${counts.runtimeCount}`,
        `Optional dependencies: ${counts.optionalCount}`,
        `Peer dependencies: ${counts.peerCount}`,
        `Bundled dependencies: ${counts.bundledCount}`,
      );
    } else {
      lines.push("Dependency scale: unavailable");
    }

    lines.push(`Quality exceptions: ${result.quality.exceptions.length}`);
    for (const exception of result.quality.exceptions) {
      lines.push(`- ${exception.name}: ${exception.message}`);
    }
    return `${lines.join("\n")}\n`;
  }

  public formatJson(result: InspectResult): string {
    return `${JSON.stringify(result, undefined, 2)}\n`;
  }
}
