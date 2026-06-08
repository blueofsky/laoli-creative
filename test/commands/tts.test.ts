import { describe, it, expect } from 'bun:test';
import { synthesizeCommand } from '../../src/commands/tts/synthesize';
import { voicesCommand } from '../../src/commands/tts/voices';
import { cloneCommand } from '../../src/commands/tts/clone';

describe('tts commands', () => {
  it('synthesize should have correct name', () => {
    expect(synthesizeCommand.name).toBe('synthesize');
    expect(synthesizeCommand.description).toBe('Synthesize speech from text');
  });

  it('voices should have correct name', () => {
    expect(voicesCommand.name).toBe('voices');
    expect(voicesCommand.description).toBe('List available voices');
  });

  it('clone should have correct name', () => {
    expect(cloneCommand.name).toBe('clone');
    expect(cloneCommand.description).toBe('Clone voice from audio sample');
  });

  it('synthesize should require --text and --output', () => {
    const textOpt = synthesizeCommand.options?.find(o => o.flag.includes('--text'));
    const outOpt = synthesizeCommand.options?.find(o => o.flag.includes('--output'));
    expect(textOpt?.required).toBe(true);
    expect(outOpt?.required).toBe(true);
  });

  it('synthesize should reject missing text', async () => {
    await expect(synthesizeCommand.execute({} as any, { output: 'test.mp3' }))
      .rejects.toThrow('Missing required argument: --text');
  });

  it('synthesize should reject missing output', async () => {
    await expect(synthesizeCommand.execute({} as any, { text: 'hello' }))
      .rejects.toThrow('Missing required argument: --output');
  });

  it('clone should require --voice-file, --text and --output', () => {
    const vfOpt = cloneCommand.options?.find(o => o.flag.includes('--voice-file'));
    const textOpt = cloneCommand.options?.find(o => o.flag.includes('--text'));
    const outOpt = cloneCommand.options?.find(o => o.flag.includes('--output'));
    expect(vfOpt?.required).toBe(true);
    expect(textOpt?.required).toBe(true);
    expect(outOpt?.required).toBe(true);
  });
});
