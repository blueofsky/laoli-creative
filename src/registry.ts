import type { Command, CommandGroup } from './types/cli';

export class Registry {
  private commands: Map<string, CommandGroup> = new Map();

  register(group: CommandGroup): void {
    this.commands.set(group.name, group);
  }

  resolve(commandPath: string[]): Command | null {
    if (commandPath.length === 0) {
      return null;
    }

    const [groupName, ...subPath] = commandPath;
    const group = this.commands.get(groupName);
    
    if (!group) {
      return null;
    }

    // 如果只有组名，返回组的帮助命令
    if (subPath.length === 0) {
      return {
        name: group.name,
        description: group.description,
        execute: async () => {
          this.printGroupHelp(group);
        },
      };
    }

    // 查找子命令
    const subCommandName = subPath[0];
    const subCommand = group.commands.find(c => c.name === subCommandName);
    
    if (!subCommand) {
      return null;
    }

    return subCommand;
  }

  getAll(): CommandGroup[] {
    return Array.from(this.commands.values());
  }

  getGroup(name: string): CommandGroup | undefined {
    return this.commands.get(name);
  }

  private printGroupHelp(group: CommandGroup): void {
    console.log(`
laoli ${group.name} - ${group.description}

Usage:
  laoli ${group.name} <subcommand> [options]

Subcommands:
${group.commands.map(cmd => {
  const padding = ' '.repeat(20 - cmd.name.length);
  return `  ${cmd.name}${padding}${cmd.description}`;
}).join('\n')}
`);
  }
}
