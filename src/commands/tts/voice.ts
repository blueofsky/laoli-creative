import type { Command, Config, Flags } from '../../types/cli';
import { json, info } from '../../utils/logger';
import { getVoices as getMinimaxVoices } from '../../providers/minimax';
import { getVoices as getMimoVoices } from '../../providers/mimo';

export const voicesCommand: Command = {
  name: 'voice',
  description: 'List available voices',
  usage: 'laoli tts voice [--provider <name>]',
  options: [
    { flag: '--provider <name>', description: 'Provider: minimax, mimo' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli tts voice',
    'laoli tts voice --provider minimax',
    'laoli tts voice --provider mimo',
    'laoli tts voice --json',
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
      console.log('ID'.padEnd(46) + '| Name'.padEnd(20) + '| Language'.padEnd(11) + '| Gender'.padEnd(8) + '| Style');
      console.log('-'.repeat(45) + '+' + '-'.repeat(18) + '+' + '-'.repeat(10) + '+' + '-'.repeat(7) + '+' + '-'.repeat(20));
      voices.forEach(voice => {
        console.log(`${voice.id.padEnd(45)}| ${(voice.name || '').padEnd(18)}| ${voice.language.padEnd(10)}| ${voice.gender.padEnd(7)}| ${voice.style}`);
      });
      console.log('');
    }
  },
};
