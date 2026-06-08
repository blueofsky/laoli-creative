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

export function addTask(task: Omit<TaskRecord, 'createdAt' | 'status'>): void {
  const tasks = readQueue();
  tasks.push({ ...task, createdAt: new Date().toISOString(), status: 'pending' });
  writeQueue(tasks);
}

export function updateTask(taskId: string, updates: Partial<TaskRecord>): void {
  const tasks = readQueue();
  const idx = tasks.findIndex(t => t.taskId === taskId);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...updates };
    writeQueue(tasks);
  }
}

export function listTasks(filter?: TaskRecord['status']): TaskRecord[] {
  const tasks = readQueue();
  return filter ? tasks.filter(t => t.status === filter) : tasks;
}

export function getTask(taskId: string): TaskRecord | undefined {
  return readQueue().find(t => t.taskId === taskId);
}
