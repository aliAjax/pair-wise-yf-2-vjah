import type { Bench } from '@/types';
import { normalizeSceneTags } from '@/utils/sceneTags';

const STORAGE_KEY = 'bench-archive-data';

export function loadBenches(): Bench[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed: unknown = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // 迁移：旧记录没有场景标签字段，默认无标签；同时清洗异常值
        return (parsed as Bench[]).map((bench) => ({
          ...bench,
          sceneTags: normalizeSceneTags((bench as Partial<Bench>).sceneTags),
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
