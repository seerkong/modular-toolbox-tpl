import { ExampleEchoRequest, ExampleEchoResponse, ExampleFileUploadResponse } from "@app/shared";
import type { ExampleService } from "@backend/core";
import { buildDemoResponse, defaultExampleEvents } from "@backend/core";

export class DefaultExampleService implements ExampleService {
  getDemo() {
    return buildDemoResponse();
  }

  echo(payload: ExampleEchoRequest): ExampleEchoResponse {
    return {
      echo: payload.message ?? "",
      timestamp: new Date().toISOString(),
    };
  }

  async *stream() {
    yield* defaultExampleEvents();
  }

  uploadFile(filename: string, content: string, contentType: string, size: number): ExampleFileUploadResponse {
    return {
      filename,
      size,
      contentType,
      content: content.substring(0, 1000), // 只返回前1000字符作为预览
      uploadedAt: new Date().toISOString(),
    };
  }
}
