import { describe, it, expect } from 'bun:test';
import { initCommand } from '../../src/commands/recipe/init';
import { schemaCommand } from '../../src/commands/recipe/schema';
import { getCommand } from '../../src/commands/recipe/get';
import { setCommand } from '../../src/commands/recipe/set';

describe('recipe commands', () => {
  // ── init ──
  describe('init', () => {
    it('should have correct name and description', () => {
      expect(initCommand.name).toBe('init');
      expect(initCommand.description).toContain('Initialize');
    });

    it('should have --skill option', () => {
      const opt = initCommand.options?.find(o => o.flag.includes('--skill'));
      expect(opt).toBeDefined();
    });

    it('should have --force option', () => {
      const opt = initCommand.options?.find(o => o.flag.includes('--force'));
      expect(opt).toBeDefined();
      expect(opt?.type).toBe('boolean');
    });
  });

  // ── schema ──
  describe('schema', () => {
    it('should have correct name and description', () => {
      expect(schemaCommand.name).toBe('schema');
      expect(schemaCommand.description).toContain('schema');
    });

    it('should have --skill option', () => {
      const opt = schemaCommand.options?.find(o => o.flag.includes('--skill'));
      expect(opt).toBeDefined();
    });

    it('should reject when schema not configured', async () => {
      await expect(schemaCommand.execute({} as any, {}))
        .rejects.toThrow(/recipe\.schema path not configured/);
    });
  });

  // ── get ──
  describe('get', () => {
    it('should have correct name and description', () => {
      expect(getCommand.name).toBe('get');
      expect(getCommand.description).toContain('Get');
    });

    it('should have --skill option', () => {
      const opt = getCommand.options?.find(o => o.flag.includes('--skill'));
      expect(opt).toBeDefined();
    });

    it('should have --key option', () => {
      const opt = getCommand.options?.find(o => o.flag.includes('--key'));
      expect(opt).toBeDefined();
    });
  });

  // ── set ──
  describe('set', () => {
    it('should have correct name and description', () => {
      expect(setCommand.name).toBe('set');
      expect(setCommand.description).toContain('Set');
    });

    it('should require --skill', () => {
      const opt = setCommand.options?.find(o => o.flag.includes('--skill'));
      expect(opt?.required).toBe(true);
    });

    it('should require --key', () => {
      const opt = setCommand.options?.find(o => o.flag.includes('--key'));
      expect(opt?.required).toBe(true);
    });

    it('should require --value', () => {
      const opt = setCommand.options?.find(o => o.flag.includes('--value'));
      expect(opt?.required).toBe(true);
    });

    it('should reject missing --skill', async () => {
      await expect(setCommand.execute({} as any, { key: 'a.b', value: 'v' }))
        .rejects.toThrow('Missing required argument: --skill');
    });

    it('should reject missing --key', async () => {
      await expect(setCommand.execute({} as any, { skill: 'test', value: 'v' }))
        .rejects.toThrow('Missing required argument: --key');
    });
  });
});
