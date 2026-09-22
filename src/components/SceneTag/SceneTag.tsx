import { BookOpen, BedDouble, Mountain, AlertTriangle } from 'lucide-react';
import type { SceneTagType } from '@/types';
import { SCENE_TAG_LABELS } from '@/types';
import {
  SCENE_TAG_ORDER,
  SCENE_TAG_REQUIREMENTS,
  isSceneTagEligible,
} from '@/rules/sceneTags';
import type { SceneTagFeatures } from '@/rules/sceneTags';

const SCENE_TAG_ICONS: Record<SceneTagType, typeof BookOpen> = {
  'quiet-reading': BookOpen,
  nap: BedDouble,
  view: Mountain,
};

const SCENE_TAG_STYLES: Record<SceneTagType, string> = {
  'quiet-reading': 'bg-moss-green/10 text-moss-green',
  nap: 'bg-ochre/10 text-ochre',
  view: 'bg-sky-700/10 text-sky-700',
};

interface SceneTagBadgesProps {
  tags: SceneTagType[];
}

/** 只读场景标签徽章，卡片与详情页共用；无标签时不渲染 */
export function SceneTagBadges({ tags }: SceneTagBadgesProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {SCENE_TAG_ORDER.filter((tag) => tags.includes(tag)).map((tag) => {
        const TagIcon = SCENE_TAG_ICONS[tag];
        return (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md ${SCENE_TAG_STYLES[tag]}`}
          >
            <TagIcon className="w-3 h-3" />
            {SCENE_TAG_LABELS[tag]}
          </span>
        );
      })}
    </div>
  );
}

interface SceneTagPickerProps {
  value: SceneTagType[];
  features: SceneTagFeatures;
  onChange: (tags: SceneTagType[]) => void;
}

/**
 * 详情页场景标签勾选器：
 * - 满足条件的标签可勾选/取消
 * - 不满足条件的标签禁用并显示条件说明
 * - 已选但因特征编辑而失配的标签高亮提示，保存时会被整次拒绝
 */
export function SceneTagPicker({ value, features, onChange }: SceneTagPickerProps) {
  const toggleTag = (tag: SceneTagType) => {
    if (!isSceneTagEligible(tag, features)) return;
    onChange(
      value.includes(tag)
        ? value.filter((item) => item !== tag)
        : [...value, tag],
    );
  };

  return (
    <div className="space-y-2">
      {SCENE_TAG_ORDER.map((tag) => {
        const TagIcon = SCENE_TAG_ICONS[tag];
        const checked = value.includes(tag);
        const eligible = isSceneTagEligible(tag, features);
        const stale = checked && !eligible;

        return (
          <label
            key={tag}
            className={`flex items-start gap-2.5 p-3 rounded-lg border transition-colors ${
              stale
                ? 'border-red-300 bg-red-50/70'
                : checked
                  ? 'border-moss-green/40 bg-moss-green/5'
                  : 'border-deep-brown/10 bg-white/40'
            } ${eligible ? 'cursor-pointer hover:bg-warm-cream' : 'cursor-not-allowed opacity-70'}`}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={!eligible}
              onChange={() => toggleTag(tag)}
              className="mt-0.5 text-moss-green focus:ring-moss-green"
            />
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-1.5 text-sm font-medium text-deep-brown">
                <TagIcon className="w-4 h-4" />
                {SCENE_TAG_LABELS[tag]}
                {stale && (
                  <span className="inline-flex items-center gap-1 text-xs text-red-500 font-normal">
                    <AlertTriangle className="w-3 h-3" />
                    已失配
                  </span>
                )}
              </span>
              {!eligible && (
                <span className="block text-xs text-ink-light mt-0.5">
                  {SCENE_TAG_REQUIREMENTS[tag]}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}

interface SceneTagFilterProps {
  value: SceneTagType | null;
  onChange: (tag: SceneTagType | null) => void;
}

/** 列表页场景标签筛选按钮组（单选，再次点击取消） */
export function SceneTagFilter({ value, onChange }: SceneTagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SCENE_TAG_ORDER.map((tag) => {
        const TagIcon = SCENE_TAG_ICONS[tag];
        const active = value === tag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(active ? null : tag)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              active
                ? 'bg-moss-green text-white border-moss-green'
                : 'bg-white/50 text-deep-brown border-deep-brown/10 hover:bg-warm-cream'
            }`}
          >
            <TagIcon className="w-3.5 h-3.5" />
            {SCENE_TAG_LABELS[tag]}
          </button>
        );
      })}
    </div>
  );
}
