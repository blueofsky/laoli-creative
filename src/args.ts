export interface ParsedArgs {
  commandPath: string[];
  flags: Record<string, string | boolean | string[]>;
  positional: string[];
}

export function parseArgs(argv: string[]): ParsedArgs {
  const commandPath: string[] = [];
  const flags: Record<string, string | boolean | string[]> = {};
  const positional: string[] = [];
  
  let i = 0;
  
  // 解析命令路径（直到遇到以 -- 开头的参数）
  while (i < argv.length && !argv[i].startsWith('--')) {
    commandPath.push(argv[i]);
    i++;
  }
  
  // 解析参数
  while (i < argv.length) {
    const arg = argv[i];
    
    if (arg.startsWith('--')) {
      const flagName = arg.slice(2);
      
      // 布尔标志
      if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) {
        flags[flagName] = true;
        i++;
      } else {
        // 值参数
        const value = argv[i + 1];
        
        // 处理数组参数（如 --ref file1 file2）
        if (flagName === 'ref' || flagName === 'input') {
          const values: string[] = [value];
          i += 2;
          while (i < argv.length && !argv[i].startsWith('--')) {
            values.push(argv[i]);
            i++;
          }
          flags[flagName] = values;
        } else {
          flags[flagName] = value;
          i += 2;
        }
      }
    } else {
      // 位置参数
      positional.push(arg);
      i++;
    }
  }
  
  return { commandPath, flags, positional };
}

export function getFlag(flags: Record<string, any>, name: string): string | undefined {
  const value = flags[name];
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : undefined;
  }
  return undefined;
}

export function getFlagAsArray(flags: Record<string, any>, name: string): string[] {
  const value = flags[name];
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return [value];
  }
  return [];
}
