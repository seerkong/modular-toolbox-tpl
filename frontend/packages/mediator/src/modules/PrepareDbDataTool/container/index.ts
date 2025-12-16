import { ContainerModule, interfaces } from "inversify";
import { PrepareDbDataApiImpl } from "@frontend/core";
import { PrepareDbDataController } from "../controller/PrepareDbDataController";

export const prepareDbDataModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(PrepareDbDataApiImpl).toSelf().inSingletonScope();
  bind(PrepareDbDataController).toSelf().inSingletonScope();
});
