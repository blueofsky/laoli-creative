import type { Command, Config, Flags } from '../../types/cli';
import { json, info } from '../../utils/logger';
import { getVoices as getMinimaxVoices } from '../../providers/minimax';
import { getVoices as getMimoVoices } from '../../providers/mimo';

export const voicesCommand: Command = {
  name: 'voices',
  description: 'List available voices',
  usage: 'laoli tts voices [--provider <name>]',
  options: [
    { flag: '--provider <name>', description: 'Provider: minimax, mimo' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli tts voices',
    'laoli tts voices --provider minimax',
    'laoli tts voices --provider mimo',
    'laoli tts voices --json',
  ],
  execute: async (config: Config, flags: Flags) => {
    const providerName = (flags.provider as string) || config.tts.defaultProvider || 'minimax';
    const isJson = flags.json as boolean;

    let voices: any[];

    try {
      if (providerName === 'mimo') {
        voices = await getMimoVoices();
      } else {
        voices = await getMinimaxVoices();
      }
    } catch {
      info('Failed to fetch voices from API.');
      return;
    }
    
    if (isJson) {
      json(voices);
    } else {
      console.log(`\nAvailable voices (${providerName}):\n`);
      console.log('ID       | Language | Gender | Style');
      console.log('---------|----------|--------|----------');
      voices.forEach(voice => {
        console.log(`${voice.id.padEnd(9)}| ${voice.language.padEnd(9)}| ${voice.gender.padEnd(7)}| ${voice.style}`);
      });
      console.log('');
    }
  },
};
