import { describe, it, expect, mock } from 'bun:test';
import { generateCommand } from '../../src/commands/imagine/generate';
import { batchCommand } from '../../src/commands/imagine/batch';

describe('imagine commands', () => {
  it('generate should have correct name', () => {
    expect(generateCommand.name).toBe('generate');
  });

  it('batch should have correct name', () => {
    expect(batchCommand.name).toBe('batch');
  });

  it('generate should require --prompt', () => {
    const opt = generateCommand.options?.find(o => o.flag.includes('--prompt'));
    expect(opt?.required).toBe(true);
  });

  it('generate should reject missing prompt', async () => {
    await expect(generateCommand.execute({} as any, { output: 'test.png' })).rejects.toThrow('Missing required argument: --prompt');
  });

  it('generate should reject missing output', async () => {
    await expect(generateCommand.execute({} as any, { prompt: 'test' })).rejects.toThrow('Missing required argument: --output');
  });
});
