import { injectable } from "inversify";
import {
  InspectTargetException,
  InspectTargetExceptionCode,
} from "../core/errors/inspect-target-exception";
import { InspectNpmPackageQualityWorkflowScheduler } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import type { InspectResult } from "./inspect-result";
import {
  InspectDelegateException,
  InspectDelegationInterpreter,
} from "./inspect-delegation-interpreter";
import { InspectExceptionFormatter } from "./report/inspect-exception-formatter";
import { InspectResultFormatterPicker } from "./report/inspect-result-formatter-picker";

export interface InspectOptions {
  readonly json?: boolean;
}

export abstract class InspectHandlerDependencies {
  public abstract stdout(text: string): void;
  public abstract stderr(text: string): void;
}

@injectable()
export class NodeInspectHandlerDependencies extends InspectHandlerDependencies {
  public stdout(text: string): void {
    process.stdout.write(text);
  }

  public stderr(text: string): void {
    process.stderr.write(text);
  }
}

@injectable()
export class InspectHandler {
  public constructor(
    private readonly scheduler: InspectNpmPackageQualityWorkflowScheduler,
    private readonly formatterPicker: InspectResultFormatterPicker,
    private readonly dependencies: InspectHandlerDependencies,
    private readonly delegationInterpreter: InspectDelegationInterpreter,
    private readonly exceptionFormatter: InspectExceptionFormatter,
  ) {}

  public async run(
    packageName: string,
    versionIdentifier: string | undefined,
    options: InspectOptions,
  ): Promise<boolean> {
    try {
      const delegation = this.delegationInterpreter.interpret(
        packageName,
        versionIdentifier,
      );
      const workflowResult = await this.scheduler.run(delegation);
      const result: InspectResult = { delegation, ...workflowResult };
      const formatter = this.formatterPicker.pick(options.json === true);
      this.dependencies.stdout(formatter.format(result));
      return true;
    } catch (error) {
      const exception =
        error instanceof InspectDelegateException ||
        error instanceof InspectTargetException
          ? error
          : new InspectTargetException(
              InspectTargetExceptionCode.InspectTargetDeterminationFailed,
              `执行 npm package 检查时发生异常：${error instanceof Error ? error.message : String(error)}`,
            );
      this.dependencies.stderr(
        `${this.exceptionFormatter.format(exception)}\n`,
      );
      return false;
    }
  }
}
