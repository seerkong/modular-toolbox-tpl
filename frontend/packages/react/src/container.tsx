import React, { createContext, useContext } from "react";
import type { Container, interfaces } from "inversify";
import { createMediatorContainer } from "@frontend/mediator";

const ContainerContext = createContext<Container | null>(null);

export const ContainerProvider: React.FC<{ container?: Container; children: React.ReactNode }> = ({
  container,
  children,
}) => {
  const value = container ?? createMediatorContainer();
  return <ContainerContext.Provider value={value}>{children}</ContainerContext.Provider>;
};

export const useContainer = () => {
  const container = useContext(ContainerContext);
  if (!container) throw new Error("Container is not provided");
  return container;
};

export const useInject = <T,>(Model: interfaces.ServiceIdentifier<T>) => {
  const container = useContainer();
  if (import.meta.hot && !container.isBound(Model)) {
    container.bind(Model).toSelf().inSingletonScope();
  }
  return container.get(Model);
};
