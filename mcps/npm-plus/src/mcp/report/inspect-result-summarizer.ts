import { injectable } from "inversify";
import type { InspectResult } from "../../facade/inspect-result";

@injectable()
export class InspectResultSummarizer {
  public summarize(result: InspectResult): string {
    const lines = [
      `检查目标  ${result.target.packageName}@${result.target.exactVersion}`,
    ];

    if (result.target.tag) {
      lines.push(`版本来源  ${result.target.tag} tag`);
    }

    lines.push("");
    const counts = result.quality.dependencyScale?.directDependencyCounts;
    if (counts) {
      lines.push(
        "依赖规模",
        `  运行时依赖  ${counts.runtimeCount}`,
        `  可选依赖    ${counts.optionalCount}`,
        `  对等依赖    ${counts.peerCount}`,
        `  捆绑依赖    ${counts.bundledCount}`,
      );
    } else {
      lines.push("依赖规模  数据不可用");
    }

    if (result.quality.exceptions.length === 0) {
      lines.push("", "数据获取异常  0");
    } else {
      lines.push("", "异常详情");
      for (const [index, exception] of result.quality.exceptions.entries()) {
        if (index > 0) lines.push("");
        lines.push(`  ${exception.name}`, `  ${exception.message}`);
      }
    }

    return lines.join("\n");
  }
}
