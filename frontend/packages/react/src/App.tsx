import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "@frontend/mediator/styles/index.css";

export const App: React.FC = () => {
  return <RouterProvider router={router} />;
};
