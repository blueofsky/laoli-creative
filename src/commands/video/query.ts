import type { Command, Config, Flags } from '../../types/cli';
import { queryVideoTask } from '../../sdk/video';
import { json, info, success, error } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

export const queryCommand: Command = {
  name: 'query',
  description: 'Query video generation task status',
  usage: 'laoli video query --task-id <id> [--output json]',
  options: [
    { flag: '--task-id <id>', description: 'Task ID', required: true },
    { flag: '--provider <name>', description: 'Provider: apimart' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli video query --task-id 12345',
    'laoli video query --task-id 12345 --json',
  ],
  execute: async (config: Config, flags: Flags) => {
    const taskId = flags['task-id'] as string;
    
    if (!taskId) {
      throw new CLIError('Missing required argument: --task-id', ExitCode.INVALID_ARGS);
    }
    
    const providerName = (flags.provider as string) || config.video.defaultProvider || 'apimart';
    const isJson = flags.json as boolean;
    
    try {
      const result = await queryVideoTask(taskId, providerName);
      
      if (isJson) {
        json(result);
      } else {
        console.log('\nVideo Task Status:\n');
        console.log(`  Task ID: ${result.taskId}`);
        console.log(`  Status: ${result.status}`);
        
        if (result.url) {
          console.log(`  URL: ${result.url}`);
        }
        
        if (result.metadata) {
          if (result.metadata.model) {
            console.log(`  Model: ${result.metadata.model}`);
          }
          if (result.metadata.duration) {
            console.log(`  Duration: ${result.metadata.duration}s`);
          }
          if (result.metadata.createdAt) {
            console.log(`  Created: ${result.metadata.createdAt}`);
          }
          if (result.metadata.completedAt) {
            console.log(`  Completed: ${result.metadata.completedAt}`);
          }
        }
        
        console.log('');
        
        if (result.status === 'completed') {
          success('Video generation completed');
        } else if (result.status === 'failed') {
          error('Video generation failed');
        } else {
          info(`Video generation ${result.status}`);
        }
      }
    } catch (error) {
      throw new CLIError(
        `Failed to query video task: ${error instanceof Error ? error.message : String(error)}`,
        ExitCode.PROVIDER_ERROR
      );
    }
  },
};
