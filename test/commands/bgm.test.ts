import { describe, it, expect } from 'bun:test';
import { generateCommand } from '../../src/commands/bgm/generate';

describe('bgm commands', () => {
  it('generate should have correct name', () => {
    expect(generateCommand.name).toBe('generate');
    expect(generateCommand.description).toBe('Generate background music');
  });

  it('generate should require --prompt and --output', () => {
    const promptOpt = generateCommand.options?.find(o => o.flag.includes('--prompt'));
    const outOpt = generateCommand.options?.find(o => o.flag.includes('--output'));
    expect(promptOpt?.required).toBe(true);
    expect(outOpt?.required).toBe(true);
  });

  it('generate should reject missing prompt', async () => {
    await expect(generateCommand.execute({} as any, { output: 'song.mp3' }))
      .rejects.toThrow('Missing required argument: --prompt');
  });

  it('generate should reject missing output', async () => {
    await expect(generateCommand.execute({} as any, { prompt: 'upbeat' }))
      .rejects.toThrow('Missing required argument: --output');
  });

  it('generate should show instrumental option', () => {
    const opt = generateCommand.options?.find(o => o.flag === '--instrumental');
    expect(opt?.type).toBe('boolean');
  });
});
