import { Container } from "inversify";
import {
  InspectHandler,
  InspectHandlerDependencies,
  NodeInspectHandlerDependencies,
} from "../facade/inspect-handler";
import { InspectReportFormatter } from "../facade/report/inspect-report-formatter";
import { npmPackageQualityModule } from "./npm-package-quality-module";

export function createInspectHandler(): InspectHandler {
  const container = new Container({ defaultScope: "Singleton" });
  container.load(npmPackageQualityModule);
  container.bind(InspectHandlerDependencies).to(NodeInspectHandlerDependencies);
  container.bind(InspectReportFormatter).toSelf();
  container.bind(InspectHandler).toSelf();
  return container.get(InspectHandler);
}
