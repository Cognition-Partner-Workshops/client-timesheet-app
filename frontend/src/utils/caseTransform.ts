type AnyObject = Record<string, unknown>;

function isObject(value: unknown): value is AnyObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function transformKeysToCamelCase<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeysToCamelCase(item)) as T;
  }

  if (isObject(obj)) {
    const result: AnyObject = {};
    for (const key of Object.keys(obj)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = transformKeysToCamelCase(obj[key]);
    }
    return result as T;
  }

  return obj as T;
}

export function transformKeysToSnakeCase<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeysToSnakeCase(item)) as T;
  }

  if (isObject(obj)) {
    const result: AnyObject = {};
    for (const key of Object.keys(obj)) {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = transformKeysToSnakeCase(obj[key]);
    }
    return result as T;
  }

  return obj as T;
}
