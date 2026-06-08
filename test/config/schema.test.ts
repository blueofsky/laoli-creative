import { describe, it, expect } from 'bun:test';
import { DEFAULT_CONFIG } from '../../src/config/schema';

describe('config schema', () => {
  it('should have default provider set to agnes', () => {
    expect(DEFAULT_CONFIG.defaultProvider).toBe('agnes');
  });

  it('should have default region set to cn', () => {
    expect(DEFAULT_CONFIG.defaultRegion).toBe('cn');
  });

  it('should have all 5 providers defined', () => {
    expect(Object.keys(DEFAULT_CONFIG.providers)).toEqual(
      ['agnes', 'apimart', 'tuzi', 'minimax', 'mimo']
    );
  });

  it('should have agnes provider default model', () => {
    expect(DEFAULT_CONFIG.providers.agnes.defaultModel).toBe('agnes-image-2.1-flash');
  });

  it('should have picgo default branch', () => {
    expect(DEFAULT_CONFIG.picgo.branch).toBe('main');
  });

  it('should have tts default voice', () => {
    expect(DEFAULT_CONFIG.tts.defaultVoice).toBe('冰糖');
  });
});
