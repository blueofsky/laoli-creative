import type { Command, Config, Flags } from '../../types/cli';
import { getProvider } from '../../providers';
import { json, info } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';
import { getVoices as getMimoVoices } from '../../providers/mimo';

const MINIMAX_VOICES = [
  { id: '冰糖', name: '冰糖', language: 'Chinese', gender: 'Female', style: '活泼少女' },
  { id: '茉莉', name: '茉莉', language: 'Chinese', gender: 'Female', style: '知性女声' },
  { id: '苏打', name: '苏打', language: 'Chinese', gender: 'Male', style: '阳光少年' },
  { id: '白桦', name: '白桦', language: 'Chinese', gender: 'Male', style: '成熟男声' },
  { id: 'Mia', name: 'Mia', language: 'English', gender: 'Female', style: 'Lively girl' },
  { id: 'Chloe', name: 'Chloe', language: 'English', gender: 'Female', style: 'Sweet Dreamy' },
  { id: 'Milo', name: 'Milo', language: 'English', gender: 'Male', style: 'Sunny boy' },
  { id: 'Dean', name: 'Dean', language: 'English', gender: 'Male', style: 'Steady Gentle' },
];

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
    
    let voices: any[] = [];
    
    if (providerName === 'mimo') {
      voices = getMimoVoices();
    } else {
      voices = MINIMAX_VOICES;
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
