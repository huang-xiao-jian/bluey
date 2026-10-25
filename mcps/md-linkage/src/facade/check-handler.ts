import { resolve } from "node:path";
import { Container, injectable } from "inversify";
import { LinkCheckComposition } from "../composition/link-check-composition";
import {
  isLinkCheckInput,
  LinkCheckDelegation,
  LinkCheckMode,
} from "../core/model/link-check-delegation";
import { HumanReportFormatter } from "./report/human-report-formatter";
import { JsonReportFormatter } from "./report/json-report-formatter";
import { ReportFormatterFactory } from "./report/report-formatter-factory";

export interface CheckOptions {
  readonly root?: string;
  readonly mode?: LinkCheckMode;
  readonly json?: boolean;
}

export abstract class CheckHandlerDependencies {
  public abstract cwd(): string;
  public abstract supportsHyperlinks(): boolean;
  public abstract stdout(text: string): void;
}

@injectable()
export class CheckHandler {
  public constructor(
    private readonly composition: LinkCheckComposition,
    private readonly reportFormatterFactory: ReportFormatterFactory,
    private readonly dependencies: CheckHandlerDependencies,
  ) {}

  public async run(
    files: readonly string[],
    options: CheckOptions,
  ): Promise<void> {
    const cwd = this.dependencies.cwd();
    const root = resolve(cwd, options.root ?? cwd);
    if (!files.every(isLinkCheckInput)) {
      throw new Error("File inputs must be non-empty strings");
    }
    const delegation = new LinkCheckDelegation(root, files, options.mode, cwd);
    const scheduler = this.composition.createLinkCheckWorkflowScheduler();
    const report = await scheduler.run(delegation);
    const formatter = this.reportFormatterFactory.create({
      ...options,
      hyperlinks: this.dependencies.supportsHyperlinks(),
    });
    const output = formatter.format(report);

    this.dependencies.stdout(`${output}\n`);
  }
}

export function createCheckHandler(dependencies: CheckHandlerDependencies) {
  const container = new Container({
    defaultScope: "Singleton",
  });

  container.bind(CheckHandler).toSelf();
  container.bind(LinkCheckComposition).toSelf();
  container.bind(CheckHandlerDependencies).toConstantValue(dependencies);
  container.bind(HumanReportFormatter).toSelf();
  container.bind(JsonReportFormatter).toSelf();
  container.bind(ReportFormatterFactory).toSelf();

  return container.get(CheckHandler);
}
