import { describe, it, expect } from 'bun:test';
import { generateCommand } from '../../src/commands/video/generate';
import { queryCommand } from '../../src/commands/video/query';
import { downloadCommand } from '../../src/commands/video/download';

const mockConfig = { video: {} } as any;

describe('video commands', () => {
  it('generate should have correct name', () => {
    expect(generateCommand.name).toBe('generate');
  });

  it('query should have correct name', () => {
    expect(queryCommand.name).toBe('query');
  });

  it('download should have correct name', () => {
    expect(downloadCommand.name).toBe('download');
  });

  it('generate should require --prompt', () => {
    const opt = generateCommand.options?.find(o => o.flag.includes('--prompt'));
    expect(opt?.required).toBe(true);
  });

  it('generate should reject missing prompt', async () => {
    await expect(generateCommand.execute(mockConfig, { output: 'test.mp4' }))
      .rejects.toThrow('Missing required argument: --prompt');
  });

  it('generate should reject missing output', async () => {
    await expect(generateCommand.execute(mockConfig, { prompt: 'waves' }))
      .rejects.toThrow('Missing required argument: --output');
  });

  it('query should require --task-id', async () => {
    await expect(queryCommand.execute(mockConfig, {}))
      .rejects.toThrow('Missing required argument: --task-id');
  });

  it('download should require --task-id', async () => {
    await expect(downloadCommand.execute(mockConfig, { output: 'v.mp4' }))
      .rejects.toThrow('Missing required argument: --task-id');
  });

  it('download should require --output', async () => {
    await expect(downloadCommand.execute(mockConfig, { 'task-id': '123' }))
      .rejects.toThrow('Missing required argument: --output');
  });
});
