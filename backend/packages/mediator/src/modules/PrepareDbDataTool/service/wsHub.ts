import type { PrepareTaskEvent } from "@app/shared";

type WsClient = {
  send: (data: string) => void;
  readyState?: number;
  close?: () => void;
};

const clients = new Set<WsClient>();
let buffer: PrepareTaskEvent[] = [];
let flushScheduled = false;

export const registerPrepareDbDataWsClient = (client: WsClient) => {
  clients.add(client);
  return () => clients.delete(client);
};

export const emitTaskEvent = (event: PrepareTaskEvent) => {
  buffer.push(event);
  scheduleFlush();
};

const scheduleFlush = () => {
  if (flushScheduled) return;
  flushScheduled = true;
  setTimeout(() => {
    flushScheduled = false;
    if (buffer.length === 0) return;
    const batch = buffer;
    buffer = [];
    const payload = JSON.stringify({ batch: true, events: batch });
    clients.forEach((client) => {
      // Check if client is open (readyState 1 = OPEN)
      if (client.readyState !== undefined && client.readyState !== 1) {
        clients.delete(client);
        return;
      }
      try {
        client.send(payload);
      } catch {
        // drop broken client
        clients.delete(client);
      }
    });
  }, 100);
};
