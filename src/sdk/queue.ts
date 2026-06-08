import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const QUEUE_FILE = join(homedir(), '.laoli', 'tasks.json');

export interface TaskRecord {
  taskId: string;
  provider: string;
  outputPath: string;
  prompt: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
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
  const dir = join(homedir(), '.laoli');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(QUEUE_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

/** 入队：添加一个任务到末尾 */
export function push(task: Omit<TaskRecord, 'createdAt' | 'status'>): void {
  const tasks = readQueue();
  tasks.push({ ...task, createdAt: new Date().toISOString(), status: 'pending' });
  writeQueue(tasks);
}

/** 出队：移除并返回最早的一个 pending 任务 */
export function pop(): TaskRecord | undefined {
  const tasks = readQueue();
  const idx = tasks.findIndex(t => t.status === 'pending' || t.status === 'processing');
  if (idx === -1) return undefined;
  const task = tasks.splice(idx, 1)[0];
  writeQueue(tasks);
  return task;
}

/** 查看队列头部（不移除） */
export function peek(): TaskRecord | undefined {
  return readQueue().find(t => t.status === 'pending' || t.status === 'processing');
}

/** 按 taskId 更新任务状态 */
export function update(taskId: string, updates: Partial<TaskRecord>): void {
  const tasks = readQueue();
  const idx = tasks.findIndex(t => t.taskId === taskId);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...updates };
    writeQueue(tasks);
  }
}

/** 按 taskId 查找单个任务 */
export function get(taskId: string): TaskRecord | undefined {
  return readQueue().find(t => t.taskId === taskId);
}

/** 列出所有任务，可按状态过滤 */
export function list(status?: TaskRecord['status']): TaskRecord[] {
  const tasks = readQueue();
  return status ? tasks.filter(t => t.status === status) : tasks;
}

/** 按 taskId 移除任务（完成/失败后出队） */
export function remove(taskId: string): boolean {
  const tasks = readQueue();
  const idx = tasks.findIndex(t => t.taskId === taskId);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  writeQueue(tasks);
  return true;
}

/** 清理已完成/失败的任务 */
export function clear(status?: 'completed' | 'failed'): number {
  const tasks = readQueue();
  const remaining = status ? tasks.filter(t => t.status !== status) : [];
  writeQueue(remaining);
  return tasks.length - remaining.length;
}

/** 队列中等待处理的任务数 */
export function size(): number {
  return readQueue().filter(t => t.status === 'pending' || t.status === 'processing').length;
}
