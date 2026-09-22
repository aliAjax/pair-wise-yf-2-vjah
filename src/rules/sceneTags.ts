import type {
  MaterialType,
  NoiseLevelType,
  SceneTagType,
  ShadeLevelType,
} from '@/types';

/** 判定场景标签时需要参考的长椅特征 */
export interface SceneTagFeatures {
  material: MaterialType;
  hasBackrest: boolean;
  shadeLevel: ShadeLevelType;
  noiseLevel: NoiseLevelType;
}

/** 场景标签固定展示顺序 */
export const SCENE_TAG_ORDER: SceneTagType[] = ['quiet-reading', 'nap', 'view'];

/** 每个场景标签的入选条件说明（界面灰显时提示） */
export const SCENE_TAG_REQUIREMENTS: Record<SceneTagType, string> = {
  'quiet-reading': '需要完全遮阴且安静',
  nap: '需要有靠背且非嘈杂',
  view: '观景不得为塑料材质',
};

/**
 * 判断单个场景标签在当前特征下是否满足条件：
 * - 安静阅读：完全遮阴 且 安静
 * - 午休：有靠背 且 非嘈杂（安静或一般）
 * - 观景：材质不是塑料
 */
export function isSceneTagEligible(
  tag: SceneTagType,
  features: SceneTagFeatures,
): boolean {
  switch (tag) {
    case 'quiet-reading':
      return features.shadeLevel === 'full' && features.noiseLevel === 'quiet';
    case 'nap':
      return features.hasBackrest && features.noiseLevel !== 'noisy';
    case 'view':
      return features.material !== 'plastic';
    default:
      return false;
  }
}

/** 返回当前特征下全部可选的场景标签 */
export function getEligibleSceneTags(
  features: SceneTagFeatures,
): SceneTagType[] {
  return SCENE_TAG_ORDER.filter((tag) => isSceneTagEligible(tag, features));
}

/** 返回已选标签中与当前特征失配的标签 */
export function getInvalidSceneTags(
  tags: SceneTagType[],
  features: SceneTagFeatures,
): SceneTagType[] {
  return tags.filter((tag) => !isSceneTagEligible(tag, features));
}

/** 校验整组场景标签是否都与特征匹配 */
export function validateSceneTags(
  tags: SceneTagType[],
  features: SceneTagFeatures,
): boolean {
  return getInvalidSceneTags(tags, features).length === 0;
}
