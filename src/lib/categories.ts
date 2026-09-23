import type { translations } from '../i18n/translations';

type Translation = (typeof translations)['zh'];

/** Shared inventory categories for boss + staff UIs */
export const INVENTORY_CATEGORY_KEYS = [
  'produce',
  'dairy',
  'bakery',
  'sauce',
  'beverage',
  'frozen',
  'ingredients',
  'supplies',
  'cleaning',
  'equipment',
  'other',
] as const;

export type InventoryCategoryKey = (typeof INVENTORY_CATEGORY_KEYS)[number];

export const CATEGORY_ICONS: Record<InventoryCategoryKey | 'all', string> = {
  all: '📦',
  produce: '🥬',
  dairy: '🥛',
  bakery: '🍰',
  sauce: '🫙',
  beverage: '🥤',
  frozen: '🧊',
  ingredients: '🌱',
  supplies: '📦',
  cleaning: '🧹',
  equipment: '🔧',
  other: '📌',
};

export function getCategoryLabel(
  t: Translation,
  key: string,
): string {
  const labels = t.inventory.categories as Record<string, string>;
  return labels[key] || key;
}

export function getCategorySelectOptions(
  t: Translation,
  options?: { includeAll?: boolean; withIcons?: boolean },
): { value: string; label: string }[] {
  const includeAll = options?.includeAll ?? false;
  const withIcons = options?.withIcons ?? false;
  const list: { value: string; label: string }[] = [];

  if (includeAll) {
    list.push({
      value: 'all',
      label: withIcons
        ? `${CATEGORY_ICONS.all} ${getCategoryLabel(t, 'all')}`
        : getCategoryLabel(t, 'all'),
    });
  }

  for (const key of INVENTORY_CATEGORY_KEYS) {
    const text = getCategoryLabel(t, key);
    list.push({
      value: key,
      label: withIcons ? `${CATEGORY_ICONS[key]} ${text}` : text,
    });
  }

  return list;
}
