import { describe, it, expect } from 'vitest';
import { safeJsonParse } from './safeJsonParse.js';

describe('safeJsonParse', () => {
  it('should parse valid JSON string', () => {
    const jsonString = '{"name": "John", "age": 30}';
    const result = safeJsonParse<{ name: string; age: number }>(jsonString);
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('should return null for invalid JSON string', () => {
    const jsonString = '{"name": "John", "age": 30';
    const result = safeJsonParse<{ name: string; age: number }>(jsonString);
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const jsonString = '';
    const result = safeJsonParse<null>(jsonString);
    expect(result).toBeNull();
  });

  it('should parse JSON string with array', () => {
    const jsonString = '[1, 2, 3]';
    const result = safeJsonParse<number[]>(jsonString);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should parse JSON string with nested objects', () => {
    const jsonString = '{"user": {"name": "John", "age": 30}}';
    const result = safeJsonParse<{ user: { name: string; age: number } }>(jsonString);
    expect(result).toEqual({ user: { name: 'John', age: 30 } });
  });

  it('should return null for non-JSON string', () => {
    const jsonString = 'Hello, World!';
    const result = safeJsonParse<string>(jsonString);
    expect(result).toBeNull();
  });
});
