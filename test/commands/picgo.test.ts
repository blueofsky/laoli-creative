import { describe, it, expect } from 'bun:test';
import { uploadCommand } from '../../src/commands/picgo/upload';
import { configCommand } from '../../src/commands/picgo/config';

describe('picgo commands', () => {
  it('upload should have correct name', () => {
    expect(uploadCommand.name).toBe('upload');
  });

  it('config should have correct name', () => {
    expect(configCommand.name).toBe('config');
  });

  it('upload should require --input', () => {
    const opt = uploadCommand.options?.find(o => o.flag.includes('--input'));
    expect(opt?.required).toBe(true);
  });

  it('upload should reject missing input', async () => {
    await expect(uploadCommand.execute({} as any, {}))
      .rejects.toThrow('Missing required argument: --input');
  });

  it('config should provide repo and token options', () => {
    const repoOpt = configCommand.options?.find(o => o.flag.includes('--repo'));
    const tokenOpt = configCommand.options?.find(o => o.flag.includes('--token'));
    expect(repoOpt).toBeDefined();
    expect(tokenOpt).toBeDefined();
  });
});
