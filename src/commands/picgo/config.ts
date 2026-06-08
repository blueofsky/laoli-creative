import type { Command, Config, Flags } from '../../types/cli';
import { savePicgoConfig, loadPicgoConfig } from '../../sdk/picgo';
import { success, info, json } from '../../utils/logger';
import { CLIError, ExitCode } from '../../errors/codes';

export const configCommand: Command = {
  name: 'config',
  description: 'Configure PicGo settings',
  usage: 'laoli picgo config --repo <owner/repo> --token <token> [options]',
  options: [
    { flag: '--repo <owner/repo>', description: 'GitHub repository' },
    { flag: '--token <token>', description: 'GitHub personal access token' },
    { flag: '--path <path>', description: 'Repository path' },
    { flag: '--branch <branch>', description: 'Branch name' },
    { flag: '--custom-url <url>', description: 'Custom domain URL' },
    { flag: '--show', description: 'Show current configuration', type: 'boolean' },
    { flag: '--json', description: 'JSON output', type: 'boolean' },
  ],
  examples: [
    'laoli picgo config --repo username/image-host --token ghp_xxxxx',
    'laoli picgo config --repo username/image-host --path assets/images --branch main',
    'laoli picgo config --repo username/image-host --custom-url "https://cdn.jsdmirror.com/gh/username/image-host@main"',
    'laoli picgo config --show',
  ],
  execute: async (config: Config, flags: Flags) => {
    const show = flags.show as boolean;
    const isJson = flags.json as boolean;
    
    // 显示当前配置
    if (show) {
      const currentConfig = loadPicgoConfig();
      if (!currentConfig) {
        info('PicGo not configured');
        return;
      }
      
      if (isJson) {
        json(currentConfig);
      } else {
        console.log('\nPicGo Configuration:\n');
        console.log(`  Repository: ${currentConfig.repo}`);
        console.log(`  Token: ${currentConfig.token.slice(0, 8)}...`);
        if (currentConfig.path) console.log(`  Path: ${currentConfig.path}`);
        if (currentConfig.branch) console.log(`  Branch: ${currentConfig.branch}`);
        if (currentConfig.customUrl) console.log(`  Custom URL: ${currentConfig.customUrl}`);
        console.log('');
      }
      return;
    }
    
    // 更新配置
    const repo = flags.repo as string;
    const token = flags.token as string;
    const path = flags.path as string;
    const branch = flags.branch as string;
    const customUrl = flags['custom-url'] as string;
    
    if (!repo && !token) {
      throw new CLIError('Missing required arguments: --repo and --token', ExitCode.INVALID_ARGS);
    }
    
    // 获取现有配置或创建新配置
    const existingConfig = loadPicgoConfig() || {
      repo: '',
      token: '',
    };
    
    // 更新配置
    const newConfig = {
      repo: repo || existingConfig.repo,
      token: token || existingConfig.token,
      path: path !== undefined ? path : existingConfig.path,
      branch: branch !== undefined ? branch : existingConfig.branch,
      customUrl: customUrl !== undefined ? customUrl : existingConfig.customUrl,
    };
    
    // 验证配置
    if (!newConfig.repo || !newConfig.token) {
      throw new CLIError('Both --repo and --token are required', ExitCode.INVALID_ARGS);
    }
    
    // 保存配置
    savePicgoConfig(newConfig);
    
    success('PicGo configuration updated');
    info(`Repository: ${newConfig.repo}`);
  },
};
