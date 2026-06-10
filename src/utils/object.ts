/**
 * 通过点号路径获取对象中的值
 * @param obj 目标对象
 * @param path 点号分隔的路径，如 "watermark.content"
 * @returns 路径对应的值，未找到返回 undefined
 */
export function getValueByPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  return current;
}
