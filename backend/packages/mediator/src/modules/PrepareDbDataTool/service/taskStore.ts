import crypto from "crypto";
import { PrepareTaskState } from "@app/shared";

const tasks = new Map<string, PrepareTaskState>();

export const createTask = (total: number): PrepareTaskState => {
  const task: PrepareTaskState = {
    id: crypto.randomUUID(),
    total,
    completed: 0,
    failed: 0,
    status: "pending",
  };
  tasks.set(task.id, task);
  return task;
};

export const getTask = (id: string) => tasks.get(id) ?? null;

export const updateTask = (id: string, update: Partial<PrepareTaskState>) => {
  const existing = tasks.get(id);
  if (!existing) return null;
  const next = { ...existing, ...update };
  tasks.set(id, next);
  return next;
};

export const cancelTask = (id: string) => {
  const existing = tasks.get(id);
  if (!existing) return null;
  existing.cancelRequested = true;
  tasks.set(id, existing);
  return existing;
};
