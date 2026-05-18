export const OPEN5E_ITEM_ID_PREFIX = "open5e:";

export const ITEM_FILTER_PROPERTIES = ["type", "rarity", "requiresAttunement", "source"];

export interface ItemBase {
  id: string;
  name: string;
  type: string;
  rarity: string;
  requiresAttunement?: string;
  source: string;
}

export interface Item extends ItemBase {
  index: string;
  desc: string;
  documentUrl?: string;
  url: string;
}

export interface Open5eItemListItem {
  slug: string;
  name: string;
  type: string;
  desc: string;
  rarity: string;
  requires_attunement: string;
  document__slug: string;
  document__title: string;
  document__url?: string;
}

export type Open5eItem = Open5eItemListItem;

interface BuildOpen5eItemListUrlArgs {
  search?: string;
  filters?: Record<string, string>;
}

interface ItemTableLoadingState {
  isOpen5ePending: boolean;
  isSignedIn: boolean | undefined;
  customRowsLoaded: boolean;
}

export function isOpen5eItemId(id: string) {
  return id.startsWith(OPEN5E_ITEM_ID_PREFIX);
}

export function getOpen5eItemSlugFromId(id: string) {
  return isOpen5eItemId(id) ? id.slice(OPEN5E_ITEM_ID_PREFIX.length) : id;
}

export function toOpen5eItemId(slug: string) {
  return `${OPEN5E_ITEM_ID_PREFIX}${slug}`;
}

export function toOpen5eItemBase(item: Open5eItemListItem): ItemBase {
  return {
    id: toOpen5eItemId(item.slug),
    name: item.name,
    type: item.type,
    rarity: item.rarity,
    requiresAttunement: normalizeOptionalString(item.requires_attunement),
    source: item.document__title || item.document__slug,
  };
}

export function toOpen5eItem(item: Open5eItem): Item {
  return {
    ...toOpen5eItemBase(item),
    index: item.slug,
    desc: item.desc,
    documentUrl: normalizeOptionalString(item.document__url),
    url: `https://api.open5e.com/v1/magicitems/${item.slug}/`,
  };
}

export function buildOpen5eItemListUrl({ search, filters }: BuildOpen5eItemListUrlArgs) {
  const url = new URL("https://api.open5e.com/v1/magicitems/");
  url.searchParams.set("limit", "100");
  url.searchParams.set("ordering", "name");

  if (search) {
    url.searchParams.set("name__icontains", search);
  }

  for (const [key, value] of Object.entries(filters ?? {})) {
    if (!value) {
      continue;
    }

    if (key === "type") {
      url.searchParams.set("type", value);
    }

    if (key === "rarity") {
      url.searchParams.set("rarity", value);
    }

    if (key === "requiresAttunement") {
      url.searchParams.set("requires_attunement", value);
    }

    if (key === "source") {
      url.searchParams.set("document__slug", value);
    }
  }

  return url;
}

export function mergeItemRows(open5eRows: ItemBase[], customRows: ItemBase[]) {
  return [...open5eRows, ...customRows].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
  );
}

export function shouldShowItemTableLoading({
  isOpen5ePending,
  isSignedIn,
  customRowsLoaded,
}: ItemTableLoadingState) {
  return isOpen5ePending || (isSignedIn === true && !customRowsLoaded);
}

function normalizeOptionalString(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
