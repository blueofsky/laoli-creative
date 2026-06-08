import { describe, it, expect } from 'bun:test';
import { getApiKey, aspectRatioToSize } from '../../src/providers/shared';

describe('shared provider utilities', () => {
  describe('aspectRatioToSize', () => {
    it('should convert 1:1 to 1024x1024', () => {
      expect(aspectRatioToSize('1:1')).toBe('1024x1024');
    });
    it('should convert 16:9 to 1536x864', () => {
      expect(aspectRatioToSize('16:9')).toBe('1536x864');
    });
    it('should return default for unknown ratio', () => {
      expect(aspectRatioToSize('unknown')).toBe('1024x1024');
    });
  });

  describe('getApiKey', () => {
    it('should throw for unknown provider', () => {
      expect(() => getApiKey('unknown')).toThrow('Unknown provider');
    });
    it('should read from environment variable', () => {
      process.env.AGNES_API_KEY = 'test-key';
      expect(getApiKey('agnes')).toBe('test-key');
      delete process.env.AGNES_API_KEY;
    });
    it('should throw when no key found', () => {
      expect(() => getApiKey('minimax')).toThrow('API key not found');
    });
  });
});
