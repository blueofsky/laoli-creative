import { Registry } from './registry';
import { parseArgs } from './args';
import { loadConfig } from './config/loader';
import { handleError } from './errors/handler';
import { setLogLevel, initLogging } from './utils/logger';
import type { Command, CommandGroup, CLIOptions, OptionDef } from './types/cli';

export class CLI {
  private registry: Registry;
  private options: CLIOptions;

  constructor(options: CLIOptions) {
    this.options = options;
    this.registry = new Registry();

    for (const command of options.commands) {
      this.registry.register(command);
    }
  }

  async run(argv: string[]): Promise<void> {
    try {
      const { commandPath, flags, positional } = parseArgs(argv);

      // 在加载配置前处理 --verbose / --log-level，存入 pending（log4js 尚未初始化）
      let cliLogLevel: string | null = null;
      if (flags.verbose) {
        cliLogLevel = 'DEBUG';
      }
      if (flags['log-level']) {
        cliLogLevel = (flags['log-level'] as string).toUpperCase();
      }
      if (cliLogLevel) {
        setLogLevel(cliLogLevel);
      }

      // --version
      if (commandPath.length === 0 && (flags.version || flags.v)) {
        console.log(`${this.options.name} ${this.options.version}`);
        return;
      }

      // 无参数 → 主帮助
      if (commandPath.length === 0) {
        this.printHelp();
        return;
      }

      const [groupName, ...subCmdPath] = commandPath;
      const group = this.registry.getGroup(groupName);

      if (!group) {
        console.error(`Unknown command: ${groupName}`);
        console.error(`Run '${this.options.name} --help' for usage.`);
        process.exit(1);
      }

      // 无子命令 → 组帮助（除非有 defaultCommand）
      if (subCmdPath.length === 0) {
        if (group.defaultCommand && !flags.help && !flags.h) {
          subCmdPath.push(group.defaultCommand);
        } else {
          this.printGroupHelp(group);
          return;
        }
      }

      // 查找子命令
      const subCmd = group.commands.find(c => c.name === subCmdPath[0]);
      if (!subCmd) {
        console.error(`Unknown subcommand: ${commandPath.join(' ')}`);
        process.exit(1);
      }

      // laoli auth login --help → 子命令详情
      if (flags.help || flags.h) {
        this.printCommandHelp(group, subCmd);
        return;
      }

      // 正常执行
      const config = loadConfig(flags);

      // 用最终配置初始化 log4js（控制台 + 日期滚动文件）
      initLogging();

      // CLI 参数中的日志级别优先级高于配置，重新应用
      if (cliLogLevel) {
        setLogLevel(cliLogLevel);
      }

      await subCmd.execute(config, { ...flags, _positional: positional });
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
  --verbose              Verbose output (enable DEBUG logs)
  --log-level <level>    Log level: DEBUG, INFO, WARN, ERROR
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

  private printGroupHelp(group: CommandGroup): void {
    const cmdPath = `${this.options.name} ${group.name}`;

    // 有默认命令 → 直接展开它的选项（扁平化，如 logs）
    if (group.defaultCommand) {
      const defaultCmd = group.commands.find(c => c.name === group.defaultCommand);
      if (defaultCmd) {
        console.log(`
${cmdPath} - ${group.description}

Usage:
  ${cmdPath} [options]

${this.getOptionsTable(defaultCmd.options || [])}

${defaultCmd.examples && defaultCmd.examples.length > 0 ? `Examples:
${defaultCmd.examples.map(e => `  # ${e}`).join('\n')}
` : ''}`);
        return;
      }
    }

    // 传统的子命令列表
    const maxNameLength = Math.max(...group.commands.map(c => c.name.length));
    console.log(`
${cmdPath} - ${group.description}

Usage:
  ${cmdPath} <subcommand> [options]

Subcommands:
${group.commands.map(cmd => {
  const padding = ' '.repeat(maxNameLength - cmd.name.length + 2);
  return `  ${cmd.name}${padding}${cmd.description}`;
}).join('\n')}

Run '${cmdPath} <subcommand> --help' for more details.
`);
  }

  private printCommandHelp(group: CommandGroup, command: Command): void {
    const cmdPath = `${this.options.name} ${group.name} ${command.name}`;

    console.log(`
${cmdPath} - ${command.description}

Usage:
${command.usage ? `  ${command.usage}` : `  ${cmdPath} [options]`}

${this.getOptionsTable(command.options || [])}

${command.examples && command.examples.length > 0 ? `Examples:
${command.examples.map(e => `  # ${e}`).join('\n')}
` : ''}`);
  }

  private getOptionsTable(options: OptionDef[]): string {
    if (options.length === 0) return '';

    const maxFlagLen = Math.max(...options.map(o => o.flag.length));
    const lines: string[] = ['Options:'];

    for (const opt of options) {
      const flag = opt.flag;
      const padding = ' '.repeat(maxFlagLen - flag.length + 2);
      const required = opt.required ? ' (required)' : '';
      lines.push(`  ${flag}${padding}${opt.description}${required}`);
    }

    return lines.join('\n');
  }
}
