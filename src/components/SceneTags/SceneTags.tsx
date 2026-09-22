import { BookOpen, BedDouble, Mountain, Check } from 'lucide-react';
import type { SceneTagType } from '@/types';
import {
  SCENE_TAG_ORDER,
  SCENE_TAG_RULES,
  getSceneTagAttributes,
  isSceneTagEligible,
} from '@/utils/sceneTags';
import type { Bench } from '@/types';

/**
 * 场景标签界面组件（规则判定全部来自 utils/sceneTags，本文件不内置规则）
 *
 * - SceneTagBadges：卡片/详情上只读展示已选标签
 * - SceneTagPicker：详情页勾选标签
 * - SceneTagFilter：列表页按标签筛选
 */

const TAG_ICONS: Record<SceneTagType, typeof BookOpen> = {
  'quiet-reading': BookOpen,
  nap: BedDouble,
  view: Mountain,
};

const TAG_STYLES: Record<SceneTagType, { active: string; plain: string }> = {
  'quiet-reading': {
    active: 'bg-moss-green/10 text-moss-green',
    plain: 'bg-moss-green/10 text-moss-green/70',
  },
  nap: {
    active: 'bg-ochre/10 text-ochre',
    plain: 'bg-ochre/10 text-ochre/70',
  },
  view: {
    active: 'bg-deep-brown/10 text-deep-brown',
    plain: 'bg-deep-brown/10 text-deep-brown/60',
  },
};

interface SceneTagBadgesProps {
  tags: SceneTagType[];
  size?: 'sm' | 'md';
  className?: string;
}

/** 只读标签徽章，无标签时不渲染任何内容（旧记录默认无标签） */
export function SceneTagBadges({ tags, size = 'sm', className = '' }: SceneTagBadgesProps) {
  if (!tags || tags.length === 0) return null;

  const ordered = SCENE_TAG_ORDER.filter((tag) => tags.includes(tag));
  const padding = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {ordered.map((tag) => {
        const Icon = TAG_ICONS[tag];
        return (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 rounded-md font-medium ${padding} ${TAG_STYLES[tag].active}`}
          >
            <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            {SCENE_TAG_RULES[tag].label}
          </span>
        );
      })}
    </div>
  );
}

interface SceneTagPickerProps {
  bench: Bench;
  onToggle: (tag: SceneTagType) => void;
}

/** 详情页场景标签勾选区：不满足条件的标签禁用并展示原因 */
export function SceneTagPicker({ bench, onToggle }: SceneTagPickerProps) {
  const attrs = getSceneTagAttributes(bench);
  const selected = bench.sceneTags || [];

  return (
    <div className="space-y-2">
      {SCENE_TAG_ORDER.map((tag) => {
        const Icon = TAG_ICONS[tag];
        const eligible = isSceneTagEligible(tag, attrs);
        const checked = selected.includes(tag);
        const style = TAG_STYLES[tag];

        return (
          <button
            key={tag}
            type="button"
            disabled={!eligible && !checked}
            onClick={() => onToggle(tag)}
            title={eligible ? undefined : SCENE_TAG_RULES[tag].requirement}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${
              checked
                ? `${style.active} border-deep-brown/10`
                : eligible
                  ? 'bg-warm-cream/60 border-deep-brown/10 text-deep-brown hover:bg-warm-cream cursor-pointer'
                  : 'bg-warm-beige/40 border-deep-brown/5 text-ink-light/50 cursor-not-allowed'
            }`}
          >
            <span
              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
                checked ? 'bg-current border-transparent' : 'border-deep-brown/20 bg-white/60'
              }`}
            >
              {checked && <Check className="w-3.5 h-3.5 text-warm-cream" />}
            </span>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">
              {SCENE_TAG_RULES[tag].label}
            </span>
            {!eligible && (
              <span className="text-xs text-ink-light/60">
                {SCENE_TAG_RULES[tag].requirement}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface SceneTagFilterProps {
  value: SceneTagType | null;
  onChange: (tag: SceneTagType | null) => void;
}

/** 列表筛选：单选标签，再次点击已选项取消筛选 */
export function SceneTagFilter({ value, onChange }: SceneTagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SCENE_TAG_ORDER.map((tag) => {
        const Icon = TAG_ICONS[tag];
        const active = value === tag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(active ? null : tag)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-lg border transition-colors ${
              active
                ? `${TAG_STYLES[tag].active} border-deep-brown/10 font-medium`
                : 'bg-white/50 border-deep-brown/10 text-ink-light hover:bg-white hover:text-deep-brown'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {SCENE_TAG_RULES[tag].label}
          </button>
        );
      })}
    </div>
  );
}
