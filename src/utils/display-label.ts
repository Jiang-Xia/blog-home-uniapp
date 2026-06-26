/**
 * API 展示字段解析（对齐 blog-home-nuxt：优先 label 中文名）
 * - 分类/标签等实体仅有 label，无 name
 * - 物品等可能同时有 name（中文商品名）与 label
 */
export function apiDisplayLabel(
  entity?: { label?: string, name?: string } | null,
  fallback = '',
): string {
  if (!entity)
    return fallback
  const text = entity.label ?? entity.name
  return text ? String(text) : fallback
}
