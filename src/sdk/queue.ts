import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const QUEUE_FILE = join(homedir(), '.laoli', 'tasks', 'queue.json');
const LOG_FILE = join(homedir(), '.laoli', 'tasks', 'archive.log');

export interface TaskRecord {
  taskId: string;
  provider: string;
  outputPath: string;
  prompt: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  costMs?: number;
}

function readQueue(): TaskRecord[] {
  try {
    if (!existsSync(QUEUE_FILE)) return [];
    return JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeQueue(tasks: TaskRecord[]): void {
  const dir = join(homedir(), '.laoli', 'tasks');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(QUEUE_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

function ensureDir(): void {
  const dir = join(homedir(), '.laoli', 'tasks');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/** 入队 */
export function push(task: Omit<TaskRecord, 'createdAt' | 'status'>): void {
  const tasks = readQueue();
  tasks.push({ ...task, createdAt: new Date().toISOString(), status: 'pending' });
  writeQueue(tasks);
}

/** 出队：移除并返回最早一个 pending/processing 任务 */
export function pop(): TaskRecord | undefined {
  const tasks = readQueue();
  const idx = tasks.findIndex(t => t.status === 'pending' || t.status === 'processing');
  if (idx === -1) return undefined;
  const task = tasks.splice(idx, 1)[0];
  writeQueue(tasks);
  return task;
}

/** 查看头部不移除 */
export function peek(): TaskRecord | undefined {
  return readQueue().find(t => t.status === 'pending' || t.status === 'processing');
}

/** 更新队列中任务的状态 */
export function update(taskId: string, updates: Partial<TaskRecord>): void {
  const tasks = readQueue();
  const idx = tasks.findIndex(t => t.taskId === taskId);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...updates };
    writeQueue(tasks);
  }
}

/** 按 taskId 查找 */
export function get(taskId: string): TaskRecord | undefined {
  return readQueue().find(t => t.taskId === taskId);
}

/** 列出未完成的任务 */
export function list(): TaskRecord[] {
  return readQueue();
}

/** 队列中待处理数量 */
export function size(): number {
  return readQueue().filter(t => t.status === 'pending' || t.status === 'processing').length;
}

/** 任务完成/失败时：从队列移除，追加到日志 */
export function archive(taskId: string, result: { status: 'completed' | 'failed'; error?: string }): void {
  const tasks = readQueue();
  const idx = tasks.findIndex(t => t.taskId === taskId);
  if (idx === -1) return;
  const task = tasks.splice(idx, 1)[0];
  writeQueue(tasks);

  ensureDir();
  const now = new Date().toISOString();
  const costMs = task.createdAt ? Date.now() - new Date(task.createdAt).getTime() : undefined;
  const record = { ...task, ...result, archivedAt: now, costMs };
  appendFileSync(LOG_FILE, JSON.stringify(record) + '\n', 'utf-8');
}

/** 查看历史日志（每行一个 JSON） */
export function history(limit = 20): TaskRecord[] {
  try {
    if (!existsSync(LOG_FILE)) return [];
    const lines = readFileSync(LOG_FILE, 'utf-8').trim().split('\n').filter(Boolean);
    return lines.slice(-limit).map(line => JSON.parse(line));
  } catch {
    return [];
  }
}
