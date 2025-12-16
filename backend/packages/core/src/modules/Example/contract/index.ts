import { ExampleDemoResponse, ExampleEchoRequest, ExampleEchoResponse, ExampleSSEEvent, ExampleFileUploadResponse } from "@app/shared";

export interface ExampleService {
  getDemo(): ExampleDemoResponse;
  echo(payload: ExampleEchoRequest): ExampleEchoResponse;
  stream(): AsyncIterable<ExampleSSEEvent>;
  uploadFile(filename: string, content: string, contentType: string, size: number): ExampleFileUploadResponse;
}

export * from "./Runtime";
