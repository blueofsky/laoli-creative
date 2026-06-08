import { Registry } from './registry';
import { parseArgs } from './args';
import { loadConfig } from './config/loader';
import { handleError } from './errors/handler';
import type { CLIOptions } from './types/cli';

export class CLI {
  private registry: Registry;
  private options: CLIOptions;

  constructor(options: CLIOptions) {
    this.options = options;
    this.registry = new Registry();
    
    // 注册所有命令组
    for (const command of options.commands) {
      this.registry.register(command);
    }
  }

  async run(argv: string[]): Promise<void> {
    try {
      // 处理全局选项
      if (argv.includes('--version') || argv.includes('-v')) {
        console.log(`${this.options.name} ${this.options.version}`);
        process.exit(0);
      }

      if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
        this.printHelp();
        process.exit(0);
      }

      // 解析命令路径
      const { commandPath, flags, positional } = parseArgs(argv);

      // 查找命令
      const command = this.registry.resolve(commandPath);
      if (!command) {
        console.error(`Unknown command: ${commandPath.join(' ')}`);
        console.error(`Run '${this.options.name} --help' for usage.`);
        process.exit(1);
      }

      // 加载配置
      const config = loadConfig(flags);

      // 执行命令
      await command.execute(config, { ...flags, _positional: positional });
    } catch (error) {
      handleError(error);
    }
  }

  private printHelp(): void {
    console.log(`
${this.options.name} - ${this.options.description}

Version: ${this.options.version}

Usage:
  ${this.options.name} <command> <subcommand> [options]

Commands:
${this.getCommandHelp()}

Global Options:
  --api-key <key>        API key
  --region <region>      Region: global, cn
  --output <format>      Output format: text, json
  --quiet                Suppress non-essential output
  --verbose              Verbose output
  --dry-run              Dry run mode
  --non-interactive      Non-interactive mode
  --help, -h             Show help
  --version, -v          Show version
`);
  }

  private getCommandHelp(): string {
    const commands = this.registry.getAll();
    const maxNameLength = Math.max(...commands.map(c => c.name.length));
    
    return commands.map(cmd => {
      const padding = ' '.repeat(maxNameLength - cmd.name.length + 2);
      return `  ${cmd.name}${padding}${cmd.description}`;
    }).join('\n');
  }
}
