export function safeJsonParse<T>(input: string): T | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}
