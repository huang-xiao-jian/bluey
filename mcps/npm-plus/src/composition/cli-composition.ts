import { Container } from "inversify";
import {
  InspectHandler,
  InspectHandlerDependencies,
  NodeInspectHandlerDependencies,
} from "../facade/inspect-handler";
import { InspectExceptionFormatter } from "../facade/report/inspect-exception-formatter";
import { InspectResultFormatterPicker } from "../facade/report/inspect-result-formatter-picker";
import { JSONInspectResultFormatter } from "../facade/report/json-inspect-result-formatter";
import { TerminalInspectExceptionFormatter } from "../facade/report/terminal-inspect-exception-formatter";
import { TerminalInspectResultFormatter } from "../facade/report/terminal-inspect-result-formatter";
import { NodeNpmPackageRegistry } from "../infrastructure/registry/node-npm-package-registry";
import { provideNpmPackageQualityModule } from "./npm-package-quality-module";

export function createInspectHandler(): InspectHandler {
  const container = new Container({ defaultScope: "Singleton" });
  const registry = new NodeNpmPackageRegistry(
    globalThis.fetch,
    process.env.NPM_CONFIG_REGISTRY ?? "https://registry.npmjs.org",
  );
  container.load(provideNpmPackageQualityModule(registry));
  container.bind(InspectHandlerDependencies).to(NodeInspectHandlerDependencies);
  container
    .bind(InspectExceptionFormatter)
    .to(TerminalInspectExceptionFormatter);
  container.bind(TerminalInspectResultFormatter).toSelf();
  container.bind(JSONInspectResultFormatter).toSelf();
  container.bind(InspectResultFormatterPicker).toSelf();
  container.bind(InspectHandler).toSelf();

  return container.get(InspectHandler);
}
