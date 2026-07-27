let counter = 0

/** Not cryptographically unique — good enough for mock/in-memory data. */
export function generateId(prefix: string): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter}`
}
