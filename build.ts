import { build } from 'bun';
import { rmSync, existsSync } from 'fs';

// 清理 dist 目录
if (existsSync('./dist')) {
  rmSync('./dist', { recursive: true });
}

// 构建 CLI
await build({
  entrypoints: ['./src/main.ts'],
  outdir: './dist',
  target: 'node',
  format: 'esm',
  splitting: true,
  sourcemap: true,
  minify: false,
  external: [
    '@clack/prompts',
    'es-toolkit',
    'undici',
  ],
});

// 构建 SDK
await build({
  entrypoints: ['./src/sdk/index.ts'],
  outdir: './dist/sdk',
  target: 'node',
  format: 'esm',
  splitting: true,
  sourcemap: true,
  minify: false,
  external: [
    '@clack/prompts',
    'es-toolkit',
    'undici',
  ],
});

console.log('Build completed!');
