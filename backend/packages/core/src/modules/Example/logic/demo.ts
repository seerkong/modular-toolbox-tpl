import { ExampleDemoResponse } from "@app/shared";
import { exampleTimestamp } from "../runtime";

export const buildDemoResponse = (): ExampleDemoResponse => ({
  message: "demo ready",
  timestamp: exampleTimestamp(),
});
