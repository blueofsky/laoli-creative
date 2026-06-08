import { describe, it, expect } from 'bun:test';
import { generateCommand } from '../../src/commands/imagine/generate';
import { editCommand } from '../../src/commands/imagine/edit';
import { batchCommand } from '../../src/commands/imagine/batch';

describe('imagine commands', () => {
  it('should register generate command', () => {
    expect(generateCommand.name).toBe('generate');
    expect(generateCommand.description).toBe('Generate images using AI');
  });

  it('should register edit command', () => {
    expect(editCommand.name).toBe('edit');
    expect(editCommand.description).toBe('Edit images using AI');
  });

  it('should register batch command', () => {
    expect(batchCommand.name).toBe('batch');
    expect(batchCommand.description).toBe('Batch generate images from JSON file');
  });

  it('generate should require --prompt and --output', () => {
    const promptOpt = generateCommand.options?.find(o => o.flag.includes('--prompt'));
    const outputOpt = generateCommand.options?.find(o => o.flag.includes('--output'));
    expect(promptOpt?.required).toBe(true);
    expect(outputOpt?.required).toBe(true);
  });

  it('generate should reject missing prompt', async () => {
    await expect(generateCommand.execute({} as any, { output: 'test.png' }))
      .rejects.toThrow('Missing required argument: --prompt');
  });

  it('generate should reject missing output', async () => {
    await expect(generateCommand.execute({} as any, { prompt: 'test' }))
      .rejects.toThrow('Missing required argument: --output');
  });
});
