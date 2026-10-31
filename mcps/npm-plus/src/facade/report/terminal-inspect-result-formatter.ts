import chalk from "chalk";
import { injectable } from "inversify";
import type { InspectResult } from "../inspect-result";
import { InspectResultFormatter } from "./inspect-result-formatter";

@injectable()
export class TerminalInspectResultFormatter extends InspectResultFormatter {
  public format(result: InspectResult): string {
    const lines = [
      `${chalk.cyan.bold("检查目标")}  ${chalk.bold(`${result.target.packageName}@${result.target.exactVersion}`)}`,
    ];

    if (result.target.tag) {
      lines.push(
        `${chalk.dim("版本来源")}  ${chalk.cyan(result.target.tag)} ${chalk.dim("tag")}`,
      );
    }

    lines.push("");
    const counts = result.quality.dependencyScale?.directDependencyCounts;
    if (counts) {
      lines.push(
        chalk.cyan.bold("依赖规模"),
        `  ${chalk.dim("运行时依赖")}  ${chalk.bold(String(counts.runtimeCount))}`,
        `  ${chalk.dim("可选依赖")}    ${chalk.bold(String(counts.optionalCount))}`,
        `  ${chalk.dim("对等依赖")}    ${chalk.bold(String(counts.peerCount))}`,
        `  ${chalk.dim("捆绑依赖")}    ${chalk.bold(String(counts.bundledCount))}`,
      );
    } else {
      lines.push(
        `${chalk.cyan.bold("依赖规模")}  ${chalk.yellow("数据不可用")}`,
      );
    }

    if (result.quality.exceptions.length === 0) {
      lines.push(
        "",
        `${chalk.dim("数据获取异常")}  ${chalk.green.bold("0")}`,
      );
    } else {
      lines.push("", chalk.yellow.bold("异常详情"));
      for (const [index, exception] of result.quality.exceptions.entries()) {
        if (index > 0) lines.push("");
        lines.push(
          `  ${chalk.yellow.bold(exception.name)}`,
          `  ${chalk.dim(exception.message)}`,
        );
      }
    }

    return `${lines.join("\n")}\n`;
  }
}
