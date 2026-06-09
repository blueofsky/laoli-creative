import { describe, it, expect } from 'bun:test';
import { synthesizeCommand as speakCommand } from '../../src/commands/tts/speak';
import { voicesCommand as voiceCommand } from '../../src/commands/tts/voice';

describe('tts commands', () => {
  it('speak should have correct name', () => {
    expect(speakCommand.name).toBe('speak');
    expect(speakCommand.description).toBe('Synthesize speech from text');
  });

  it('voice should have correct name', () => {
    expect(voiceCommand.name).toBe('voice');
    expect(voiceCommand.description).toBe('List available voices');
  });

  it('speak should require --text and --output', () => {
    const textOpt = speakCommand.options?.find(o => o.flag.includes('--text'));
    const outOpt = speakCommand.options?.find(o => o.flag.includes('--output'));
    expect(textOpt?.required).toBe(true);
    expect(outOpt?.required).toBe(true);
  });

  it('speak should reject missing text', async () => {
    await expect(speakCommand.execute({} as any, { output: 'test.mp3' }))
      .rejects.toThrow('Missing required argument: --text');
  });

  it('speak should reject missing output', async () => {
    await expect(speakCommand.execute({} as any, { text: 'hello' }))
      .rejects.toThrow('Missing required argument: --output');
  });
});
