export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + '...';
}

export function indent(str: string, spaces: number): string {
  const indentStr = ' '.repeat(spaces);
  return str.split('\n').map(line => indentStr + line).join('\n');
}

export function table(rows: string[][]): string {
  if (rows.length === 0) {
    return '';
  }
  
  // 计算每列的最大宽度
  const columnWidths = rows[0].map((_, colIndex) => {
    return Math.max(...rows.map(row => (row[colIndex] || '').length));
  });
  
  // 格式化行
  return rows.map(row => {
    return row.map((cell, colIndex) => {
      return (cell || '').padEnd(columnWidths[colIndex]);
    }).join('  ');
  }).join('\n');
}
