import { describe, it, expect, mock } from 'bun:test';
import { generateCommand } from '../../src/commands/imagine/generate';

describe('imagine generate command', () => {
  it('should have correct name', () => {
    expect(generateCommand.name).toBe('generate');
  });

  it('should have correct description', () => {
    expect(generateCommand.description).toBe('Generate images using AI');
  });

  it('should have required options', () => {
    const options = generateCommand.options || [];
    const promptOption = options.find(o => o.flag.includes('--prompt'));
    const outputOption = options.find(o => o.flag.includes('--output'));
    
    expect(promptOption).toBeDefined();
    expect(promptOption?.required).toBe(true);
    expect(outputOption).toBeDefined();
    expect(outputOption?.required).toBe(true);
  });

  it('should throw error when prompt is missing', async () => {
    const config = {} as any;
    const flags = { output: 'test.png' };
    
    await expect(generateCommand.execute(config, flags)).rejects.toThrow('Missing required argument: --prompt');
  });

  it('should throw error when output is missing', async () => {
    const config = {} as any;
    const flags = { prompt: 'A cat' };
    
    await expect(generateCommand.execute(config, flags)).rejects.toThrow('Missing required argument: --output');
  });
});
