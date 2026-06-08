import { describe, it, expect } from 'bun:test';
import { DEFAULT_CONFIG } from '../../src/config/schema';

describe('config schema', () => {
  it('should have default provider set to agnes', () => {
    expect(DEFAULT_CONFIG.defaultProvider).toBe('agnes');
  });

  it('should have all 5 providers', () => {
    expect(Object.keys(DEFAULT_CONFIG.providers)).toEqual(['agnes', 'apimart', 'tuzi', 'minimax', 'mimo']);
  });
});
