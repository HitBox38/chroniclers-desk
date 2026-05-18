export const OPEN5E_SPELL_ID_PREFIX = "open5e:";

export const SPELL_FILTER_PROPERTIES = ["level", "school", "class", "source"];

export interface SpellBase {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  classes: string[];
  source: string;
}

export interface Spell extends SpellBase {
  index: string;
  desc: string;
  higherLevel?: string;
  page?: string;
  components: string[];
  material?: string;
  canBeCastAsRitual: boolean;
  duration: string;
  requiresConcentration: boolean;
  levelLabel: string;
  archetype?: string;
  circles?: string;
  url: string;
}

export interface Open5eSpellListItem {
  slug: string;
  name: string;
  range: string;
  casting_time: string;
  level_int: number;
  school: string;
  dnd_class: string;
  document__slug: string;
  document__title: string;
}

export interface Open5eSpell extends Open5eSpellListItem {
  desc: string;
  higher_level?: string;
  page?: string;
  target_range_sort?: number | null;
  components: string;
  requires_verbal_components: boolean;
  requires_somatic_components: boolean;
  requires_material_components: boolean;
  material?: string;
  can_be_cast_as_ritual: boolean;
  ritual: string;
  duration: string;
  concentration: string;
  requires_concentration: boolean;
  level: string;
  spell_level: number;
  spell_lists: string[];
  archetype?: string;
  circles?: string;
  document__license_url?: string;
  document__url?: string;
}

interface BuildOpen5eSpellListUrlArgs {
  search?: string;
  filters?: Record<string, string>;
}

interface SpellTableLoadingState {
  isOpen5ePending: boolean;
  isSignedIn: boolean | undefined;
  customRowsLoaded: boolean;
}

export function isOpen5eSpellId(id: string) {
  return id.startsWith(OPEN5E_SPELL_ID_PREFIX);
}

export function getOpen5eSpellSlugFromId(id: string) {
  return isOpen5eSpellId(id) ? id.slice(OPEN5E_SPELL_ID_PREFIX.length) : id;
}

export function toOpen5eSpellId(slug: string) {
  return `${OPEN5E_SPELL_ID_PREFIX}${slug}`;
}

export function toOpen5eSpellBase(spell: Open5eSpellListItem): SpellBase {
  return {
    id: toOpen5eSpellId(spell.slug),
    name: spell.name,
    level: spell.level_int,
    school: spell.school,
    castingTime: spell.casting_time,
    range: spell.range,
    classes: splitClasses(spell.dnd_class),
    source: spell.document__title || spell.document__slug,
  };
}

export function toOpen5eSpell(spell: Open5eSpell): Spell {
  return {
    ...toOpen5eSpellBase(spell),
    index: spell.slug,
    desc: spell.desc,
    higherLevel: normalizeOptionalString(spell.higher_level),
    page: normalizeOptionalString(spell.page),
    components: splitComponents(spell.components),
    material: normalizeOptionalString(spell.material),
    canBeCastAsRitual: spell.can_be_cast_as_ritual,
    duration: spell.duration,
    requiresConcentration: spell.requires_concentration,
    levelLabel: spell.level,
    archetype: normalizeOptionalString(spell.archetype),
    circles: normalizeOptionalString(spell.circles),
    url: `https://api.open5e.com/v1/spells/${spell.slug}/`,
  };
}

export function buildOpen5eSpellListUrl({ search, filters }: BuildOpen5eSpellListUrlArgs) {
  const url = new URL("https://api.open5e.com/v1/spells/");
  url.searchParams.set("limit", "100");
  url.searchParams.set("ordering", "name");

  if (search) {
    url.searchParams.set("name__icontains", search);
  }

  for (const [key, value] of Object.entries(filters ?? {})) {
    if (!value) {
      continue;
    }

    if (key === "level") {
      url.searchParams.set("spell_level", value);
    }

    if (key === "school") {
      url.searchParams.set("school", value);
    }

    if (key === "class") {
      url.searchParams.set("dnd_class__icontains", value);
    }

    if (key === "source") {
      url.searchParams.set("document__slug", value);
    }
  }

  return url;
}

export function mergeSpellRows(open5eRows: SpellBase[], customRows: SpellBase[]) {
  return [...open5eRows, ...customRows].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
  );
}

export function shouldShowSpellTableLoading({
  isOpen5ePending,
  isSignedIn,
  customRowsLoaded,
}: SpellTableLoadingState) {
  return isOpen5ePending || (isSignedIn === true && !customRowsLoaded);
}

function splitClasses(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function splitComponents(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeOptionalString(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
