import type { Bench, SceneTagType } from '@/types';
import { SCENE_TAG_LABELS } from '@/types';

/**
 * 场景标签业务规则（唯一规则来源）
 *
 * - 安静阅读：完全遮阴且安静
 * - 午休：有靠背且非嘈杂
 * - 观景：材质不得为塑料
 */

/** 稳定的标签顺序，供列表筛选、详情勾选、卡片展示统一使用 */
export const SCENE_TAG_ORDER: SceneTagType[] = ['quiet-reading', 'nap', 'view'];

interface SceneTagRule {
  tag: SceneTagType;
  label: string;
  /** 满足条件的说明 */
  requirement: string;
  /** 判定当前属性组合是否满足该标签 */
  isEligible: (attrs: SceneTagAttributes) => boolean;
}

/** 参与场景标签判定的属性子集 */
export interface SceneTagAttributes {
  material: Bench['material'];
  hasBackrest: boolean;
  shadeLevel: Bench['shadeLevel'];
  noiseLevel: Bench['noiseLevel'];
}

export const SCENE_TAG_RULES: Record<SceneTagType, SceneTagRule> = {
  'quiet-reading': {
    tag: 'quiet-reading',
    label: SCENE_TAG_LABELS['quiet-reading'],
    requirement: '需完全遮阴且环境安静',
    isEligible: (attrs) => attrs.shadeLevel === 'full' && attrs.noiseLevel === 'quiet',
  },
  nap: {
    tag: 'nap',
    label: SCENE_TAG_LABELS.nap,
    requirement: '需有靠背且环境非嘈杂',
    isEligible: (attrs) => attrs.hasBackrest && attrs.noiseLevel !== 'noisy',
  },
  view: {
    tag: 'view',
    label: SCENE_TAG_LABELS.view,
    requirement: '材质不得为塑料',
    isEligible: (attrs) => attrs.material !== 'plastic',
  },
};

export function getSceneTagAttributes(bench: Pick<Bench, 'material' | 'hasBackrest' | 'shadeLevel' | 'noiseLevel'>): SceneTagAttributes {
  return {
    material: bench.material,
    hasBackrest: bench.hasBackrest,
    shadeLevel: bench.shadeLevel,
    noiseLevel: bench.noiseLevel,
  };
}

/** 单个标签在给定属性下是否可勾选 */
export function isSceneTagEligible(tag: SceneTagType, attrs: SceneTagAttributes): boolean {
  return SCENE_TAG_RULES[tag].isEligible(attrs);
}

/** 给定属性下所有可勾选的标签 */
export function getEligibleSceneTags(attrs: SceneTagAttributes): SceneTagType[] {
  return SCENE_TAG_ORDER.filter((tag) => SCENE_TAG_RULES[tag].isEligible(attrs));
}

/**
 * 找出已选标签中与给定属性失配的标签。
 * 编辑材质、靠背、遮阴或噪音后用它判定是否应拒绝保存。
 */
export function getMismatchedSceneTags(
  selectedTags: SceneTagType[],
  attrs: SceneTagAttributes,
): SceneTagType[] {
  return selectedTags.filter((tag) => !SCENE_TAG_RULES[tag].isEligible(attrs));
}

/**
 * 规范化从存储中读入的标签数据：
 * - 旧记录无该字段时默认无标签
 * - 去除未知/重复标签
 * - 不按属性剔除标签（失配标签保留在数据中，由保存校验拦截）
 */
export function normalizeSceneTags(raw: unknown): SceneTagType[] {
  if (!Array.isArray(raw)) return [];
  const known = new Set<SceneTagType>(SCENE_TAG_ORDER);
  const result: SceneTagType[] = [];
  for (const value of raw) {
    if (known.has(value as SceneTagType) && !result.includes(value as SceneTagType)) {
      result.push(value as SceneTagType);
    }
  }
  return result;
}
