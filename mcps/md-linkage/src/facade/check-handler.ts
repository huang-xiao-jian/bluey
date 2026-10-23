import { resolve } from "node:path";
import { Container, inject, injectable } from "inversify";
import { LinkCheckComposition } from "../composition/link-check-composition";
import {
  isConcreteDocumentPath,
  LinkCheckDelegation,
  LinkCheckMode,
} from "../core/model/link-check-delegation";
import { HumanReportFormatter } from "./report/human-report-formatter";
import { JsonReportFormatter } from "./report/json-report-formatter";
import { ReportFormatterFactory } from "./report/report-formatter-factory";
import {
  ReportFormat,
  ReportFormatter,
} from "./report/report-formatter";

export interface CheckOptions {
  readonly root?: string;
  readonly mode?: LinkCheckMode;
  readonly json?: boolean;
}

export abstract class CheckHandlerDependencies {
  public abstract cwd(): string;
  public abstract stdout(text: string): void;
}

@injectable()
export class CheckHandler {
  public constructor(
    private readonly composition: LinkCheckComposition,
    @inject(ReportFormatterFactory)
    private readonly reportFormatterFactory: ReportFormatterFactory,
    @inject(CheckHandlerDependencies)
    private readonly dependencies: CheckHandlerDependencies,
  ) {}

  public async run(
    files: readonly string[],
    options: CheckOptions,
  ): Promise<void> {
    const cwd = this.dependencies.cwd();
    const root = resolve(cwd, options.root ?? cwd);
    if (!files.every(isConcreteDocumentPath)) {
      throw new Error("Document paths must be non-empty concrete paths");
    }
    const startingFiles = files.map((file) => resolve(cwd, file));
    const delegation = new LinkCheckDelegation(root, startingFiles, options.mode);
    const scheduler = this.composition.createLinkCheckWorkflowScheduler();
    const report = await scheduler.run(delegation);
    const formatter = this.reportFormatterFactory.create(options);
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
  container
    .bind(ReportFormatter)
    .to(HumanReportFormatter)
    .whenNamed(ReportFormat.Human);
  container
    .bind(ReportFormatter)
    .to(JsonReportFormatter)
    .whenNamed(ReportFormat.Json);
  container.bind(ReportFormatterFactory).toSelf();

  return container.get(CheckHandler);
}
