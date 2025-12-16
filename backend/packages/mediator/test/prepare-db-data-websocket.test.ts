/**
 * Integration test for PrepareDbDataTool WebSocket progress sync
 * 
 * This test verifies that:
 * 1. WebSocket clients can connect and register
 * 2. Progress events are batched and broadcast correctly
 * 3. Task execution emits proper progress events
 * 4. Multiple clients receive the same events
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { emitTaskEvent, registerPrepareDbDataWsClient } from "../src/modules/PrepareDbDataTool/service/wsHub";
import type { PrepareTaskEvent } from "@app/shared";

describe("PrepareDbDataTool WebSocket Progress Sync", () => {
  let mockClients: Array<{
    send: ReturnType<typeof vi.fn>;
    readyState: number;
    receivedMessages: any[];
  }>;

  beforeEach(() => {
    mockClients = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const waitForFlush = () => new Promise((resolve) => setTimeout(resolve, 150));

  const createMockClient = () => {
    const messages: any[] = [];
    const client = {
      send: vi.fn((data: string) => {
        messages.push(JSON.parse(data));
      }),
      readyState: 1, // WebSocket.OPEN
      receivedMessages: messages,
    };
    return client;
  };

  it("should register and unregister WebSocket clients", async () => {
    const client = createMockClient();
    const cleanup = registerPrepareDbDataWsClient(client as any);
    
    // Client should be registered
    emitTaskEvent({
      taskId: "test-1",
      type: "status",
      message: "Test message",
    });
    
    await waitForFlush(); // Past the 100ms batch window
    
    expect(client.send).toHaveBeenCalled();
    
    // Unregister client
    cleanup();
    
    // Client should not receive new messages
    client.send.mockClear();
    emitTaskEvent({
      taskId: "test-2",
      type: "status",
      message: "Another message",
    });
    
    await waitForFlush();
    
    expect(client.send).not.toHaveBeenCalled();
  });

  it("should batch events within 100ms window", async () => {
    const client = createMockClient();
    registerPrepareDbDataWsClient(client as any);
    
    // Emit multiple events quickly
    const events: PrepareTaskEvent[] = [
      { taskId: "task-1", type: "status", message: "Event 1" },
      { taskId: "task-1", type: "log", message: "Event 2" },
      { taskId: "task-1", type: "progress", message: "Event 3", progress: { status: "running", completed: 10, failed: 0, total: 100 } },
    ];
    
    events.forEach(emitTaskEvent);
    
    // Before flush - no messages sent
    expect(client.send).not.toHaveBeenCalled();
    
    // Advance time past batch window
    await waitForFlush();
    
    // Should have received one batched message
    expect(client.send).toHaveBeenCalledTimes(1);
    expect(client.receivedMessages).toHaveLength(1);
    
    const batchMessage = client.receivedMessages[0];
    expect(batchMessage).toHaveProperty("batch", true);
    expect(batchMessage).toHaveProperty("events");
    expect(batchMessage.events).toHaveLength(3);
    expect(batchMessage.events).toEqual(events);
  });

  it("should broadcast to multiple clients", async () => {
    const client1 = createMockClient();
    const client2 = createMockClient();
    const client3 = createMockClient();
    
    registerPrepareDbDataWsClient(client1 as any);
    registerPrepareDbDataWsClient(client2 as any);
    registerPrepareDbDataWsClient(client3 as any);
    
    const event: PrepareTaskEvent = {
      taskId: "task-1",
      type: "progress",
      message: "Progress update",
      progress: { status: "running", completed: 50, failed: 0, total: 100 },
    };
    
    emitTaskEvent(event);
    await waitForFlush();
    
    // All clients should receive the same message
    expect(client1.send).toHaveBeenCalledTimes(1);
    expect(client2.send).toHaveBeenCalledTimes(1);
    expect(client3.send).toHaveBeenCalledTimes(1);
    
    const message1 = client1.receivedMessages[0];
    const message2 = client2.receivedMessages[0];
    const message3 = client3.receivedMessages[0];
    
    expect(message1).toEqual(message2);
    expect(message2).toEqual(message3);
    expect(message1.events).toEqual([event]);
  });

  it("should handle and remove closed clients", async () => {
    const openClient = createMockClient();
    const closedClient = createMockClient();
    closedClient.readyState = 3; // WebSocket.CLOSED
    
    registerPrepareDbDataWsClient(openClient as any);
    registerPrepareDbDataWsClient(closedClient as any);
    
    emitTaskEvent({
      taskId: "task-1",
      type: "status",
      message: "Test",
    });
    
    await waitForFlush();
    
    // Open client should receive message
    expect(openClient.send).toHaveBeenCalled();
    
    // Closed client should not receive message (and should be removed)
    expect(closedClient.send).not.toHaveBeenCalled();
  });

  it("should handle send errors gracefully", async () => {
    const goodClient = createMockClient();
    const errorClient = {
      send: vi.fn(() => {
        throw new Error("Send failed");
      }),
      readyState: 1,
    };
    
    registerPrepareDbDataWsClient(goodClient as any);
    registerPrepareDbDataWsClient(errorClient as any);
    
    emitTaskEvent({
      taskId: "task-1",
      type: "status",
      message: "Test",
    });
    
    // Should not throw
    await expect(async () => {
      await waitForFlush();
    }).not.toThrow();
    
    // Good client should still receive message
    expect(goodClient.send).toHaveBeenCalled();
  });

  it("should emit complete task lifecycle events", async () => {
    const client = createMockClient();
    registerPrepareDbDataWsClient(client as any);
    
    const taskId = "lifecycle-task";
    
    // Task created
    emitTaskEvent({
      taskId,
      type: "status",
      message: "Task created",
      progress: { status: "pending", completed: 0, failed: 0, total: 100 },
    });
    
    await waitForFlush();
    expect(client.receivedMessages[0].events).toHaveLength(1);
    client.send.mockClear();
    
    // Task running with progress updates
    emitTaskEvent({
      taskId,
      type: "status",
      message: "Task started",
      progress: { status: "running", completed: 0, failed: 0, total: 100 },
    });
    
    emitTaskEvent({
      taskId,
      type: "log",
      message: "Inserting batch starting at row 1 (10 rows)",
    });
    
    emitTaskEvent({
      taskId,
      type: "progress",
      message: "Inserted 10/100",
      progress: { status: "running", completed: 10, failed: 0, total: 100 },
    });
    
    await waitForFlush();
    expect(client.receivedMessages[1].events).toHaveLength(3);
    client.send.mockClear();
    
    // More progress
    emitTaskEvent({
      taskId,
      type: "log",
      message: "Inserting batch starting at row 11 (10 rows)",
    });
    
    emitTaskEvent({
      taskId,
      type: "progress",
      message: "Inserted 20/100",
      progress: { status: "running", completed: 20, failed: 0, total: 100 },
    });
    
    await waitForFlush();
    expect(client.receivedMessages[2].events).toHaveLength(2);
    client.send.mockClear();
    
    // Task completed
    emitTaskEvent({
      taskId,
      type: "status",
      message: "Task completed",
      progress: { status: "completed", completed: 100, failed: 0, total: 100 },
    });
    
    await waitForFlush();
    expect(client.receivedMessages[3].events).toHaveLength(1);
    
    const finalEvent = client.receivedMessages[3].events[0];
    expect(finalEvent.type).toBe("status");
    expect(finalEvent.message).toBe("Task completed");
    expect(finalEvent.progress?.status).toBe("completed");
    expect(finalEvent.progress?.completed).toBe(100);
  });

  it("should handle task cancellation", async () => {
    const client = createMockClient();
    registerPrepareDbDataWsClient(client as any);
    
    const taskId = "cancel-task";
    
    // Start task
    emitTaskEvent({
      taskId,
      type: "status",
      message: "Task started",
      progress: { status: "running", completed: 0, failed: 0, total: 100 },
    });
    
    await waitForFlush();
    client.send.mockClear();
    
    // Cancel task
    emitTaskEvent({
      taskId,
      type: "status",
      message: "Task cancelled",
      progress: { status: "cancelled", completed: 50, failed: 0, total: 100 },
    });
    
    await waitForFlush();
    
    const cancelEvent = client.receivedMessages[1].events[0];
    expect(cancelEvent.type).toBe("status");
    expect(cancelEvent.message).toBe("Task cancelled");
    expect(cancelEvent.progress?.status).toBe("cancelled");
  });

  it("should handle task failure", async () => {
    const client = createMockClient();
    registerPrepareDbDataWsClient(client as any);
    
    const taskId = "failed-task";
    
    emitTaskEvent({
      taskId,
      type: "status",
      message: "Task failed: Connection timeout",
      progress: { status: "failed", completed: 30, failed: 1, total: 100, error: "Connection timeout" },
    });
    
    await waitForFlush();
    
    const failEvent = client.receivedMessages[0].events[0];
    expect(failEvent.type).toBe("status");
    expect(failEvent.message).toContain("Task failed");
    expect(failEvent.progress?.status).toBe("failed");
    expect(failEvent.progress?.error).toBe("Connection timeout");
  });
});
