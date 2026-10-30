import { Container } from "inversify";
import {
  InspectHandler,
  InspectHandlerDependencies,
  NodeInspectHandlerDependencies,
} from "../facade/inspect-handler";
import { InspectResultFormatterPicker } from "../facade/report/inspect-result-formatter-picker";
import { JSONInspectResultFormatter } from "../facade/report/json-inspect-result-formatter";
import { TerminalInspectResultFormatter } from "../facade/report/terminal-inspect-result-formatter";
import { npmPackageQualityModule } from "./npm-package-quality-module";

export function createInspectHandler(): InspectHandler {
  const container = new Container({ defaultScope: "Singleton" });
  container.load(npmPackageQualityModule);
  container.bind(InspectHandlerDependencies).to(NodeInspectHandlerDependencies);
  container.bind(TerminalInspectResultFormatter).toSelf();
  container.bind(JSONInspectResultFormatter).toSelf();
  container.bind(InspectResultFormatterPicker).toSelf();
  container.bind(InspectHandler).toSelf();
  return container.get(InspectHandler);
}
