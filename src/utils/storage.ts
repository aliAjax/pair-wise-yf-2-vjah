import type { Bench, SceneTagType } from '@/types';
import { SCENE_TAG_ORDER } from '@/rules/sceneTags';

const STORAGE_KEY = 'bench-archive-data';

const VALID_SCENE_TAGS = new Set<SceneTagType>(SCENE_TAG_ORDER);

/**
 * 规范化场景标签字段：
 * - 旧记录没有该字段时默认为空（旧记录无标签）
 * - 剔除非法值并去重，保证刷新后数据结构稳定
 */
function normalizeSceneTags(raw: unknown): SceneTagType[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<SceneTagType>();
  for (const value of raw) {
    if (typeof value === 'string' && VALID_SCENE_TAGS.has(value as SceneTagType)) {
      seen.add(value as SceneTagType);
    }
  }
  return SCENE_TAG_ORDER.filter((tag) => seen.has(tag));
}

export function loadBenches(): Bench[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed: unknown = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // 旧记录默认无标签，其余数据原样保留
        return parsed.map((item) => ({
          ...(item as Bench),
          sceneTags: normalizeSceneTags((item as Partial<Bench>).sceneTags),
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load benches from localStorage:', error);
  }
  return [];
}

export function saveBenches(benches: Bench[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(benches));
  } catch (error) {
    console.error('Failed to save benches to localStorage:', error);
  }
}

export function clearBenches(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear benches from localStorage:', error);
  }
}
