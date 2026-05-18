export const OPEN5E_MONSTER_ID_PREFIX = "open5e:";

export const BESTIARY_FILTER_PROPERTIES = ["type", "size", "challengeRating", "source"];

interface BestiaryMonsterBase {
  type: string;
  subtype?: string;
  name: string;
  id: string;
  size: string;
  hitPoints: number;
}

interface BestiaryReference {
  index: string;
  name: string;
  url: string;
}

interface BestiaryAction {
  name: string;
  desc: string;
  attackBonus?: number;
}

interface BestiaryMonster extends BestiaryMonsterBase {
  index: string;
  alignment: string;
  armorClass: Array<{ type: string; value: number; desc?: string }>;
  hitDice: string;
  hitPointsRoll: string;
  speed: {
    walk?: string;
    swim?: string;
    fly?: string;
    burrow?: string;
    climb?: string;
    hover?: boolean;
  };
  initiative?: number;
  proficiencies: Array<{ value: number; proficiency: BestiaryReference }>;
  damageVulnerabilities: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: BestiaryReference[];
  senses: {
    darkvision?: string;
    passivePerception: number;
    blindsight?: string;
    truesight?: string;
    tremorsense?: string;
  };
  languages: string;
  challengeRating: number;
  proficiencyBonus: number;
  xp: number;
  specialAbilities?: BestiaryAction[];
  actions?: BestiaryAction[];
  legendaryActions?: BestiaryAction[];
  image?: string;
  url: string;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  desc?: string;
  reactions?: BestiaryAction[];
  source?: string;
}

type BestiarySpeedKey = Exclude<keyof BestiaryMonster["speed"], "hover">;

export interface Open5eMonsterListItem {
  slug: string;
  name: string;
  type: string;
  subtype?: string | null;
  size: string;
  hit_points: number;
}

export interface Open5eMonster extends Open5eMonsterListItem {
  desc: string;
  alignment: string;
  armor_class: number;
  armor_desc?: string | null;
  hit_dice: string;
  speed: Record<string, number | boolean | string | null | undefined>;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  skills?: Record<string, number | null> | null;
  damage_vulnerabilities?: string;
  damage_resistances?: string;
  damage_immunities?: string;
  condition_immunities?: string;
  senses?: string;
  languages?: string;
  challenge_rating: string;
  cr: number;
  actions?: Open5eAction[] | null;
  reactions?: Open5eAction[] | null;
  legendary_actions?: Open5eAction[] | null;
  special_abilities?: Open5eAction[] | null;
  img_main?: string | null;
  document__slug: string;
  document__title: string;
}

interface Open5eAction {
  name: string;
  desc: string;
  attack_bonus?: number;
}

interface BuildOpen5eListUrlArgs {
  search?: string;
  filters?: Record<string, string>;
  offset?: number;
}

const CHALLENGE_RATING_XP = new Map<number, number>([
  [0, 10],
  [0.125, 25],
  [0.25, 50],
  [0.5, 100],
  [1, 200],
  [2, 450],
  [3, 700],
  [4, 1100],
  [5, 1800],
  [6, 2300],
  [7, 2900],
  [8, 3900],
  [9, 5000],
  [10, 5900],
  [11, 7200],
  [12, 8400],
  [13, 10000],
  [14, 11500],
  [15, 13000],
  [16, 15000],
  [17, 18000],
  [18, 20000],
  [19, 22000],
  [20, 25000],
  [21, 33000],
  [22, 41000],
  [23, 50000],
  [24, 62000],
  [25, 75000],
  [26, 90000],
  [27, 105000],
  [28, 120000],
  [29, 135000],
  [30, 155000],
]);

const BESTIARY_SPEED_KEYS = new Set<string>(["walk", "swim", "fly", "burrow", "climb"]);

export function isOpen5eMonsterId(id: string) {
  return id.startsWith(OPEN5E_MONSTER_ID_PREFIX);
}

export function getOpen5eSlugFromId(id: string) {
  return isOpen5eMonsterId(id) ? id.slice(OPEN5E_MONSTER_ID_PREFIX.length) : id;
}

export function toOpen5eMonsterId(slug: string) {
  return `${OPEN5E_MONSTER_ID_PREFIX}${slug}`;
}

export function toOpen5eMonsterBase(monster: Open5eMonsterListItem): BestiaryMonsterBase {
  const subtype = normalizeOptionalString(monster.subtype);
  return {
    id: toOpen5eMonsterId(monster.slug),
    name: monster.name,
    type: monster.type,
    ...(subtype ? { subtype } : {}),
    size: monster.size,
    hitPoints: monster.hit_points,
  };
}

export function toOpen5eMonster(monster: Open5eMonster): BestiaryMonster {
  const challengeRating = Number(monster.cr);

  return {
    ...toOpen5eMonsterBase(monster),
    index: monster.slug,
    alignment: monster.alignment,
    armorClass: [
      {
        type: normalizeOptionalString(monster.armor_desc) ?? "armor",
        value: monster.armor_class,
      },
    ],
    hitDice: monster.hit_dice,
    hitPointsRoll: monster.hit_dice,
    speed: mapSpeed(monster.speed),
    proficiencies: mapSkillProficiencies(monster.skills),
    damageVulnerabilities: splitList(monster.damage_vulnerabilities),
    damageResistances: splitList(monster.damage_resistances),
    damageImmunities: splitList(monster.damage_immunities),
    conditionImmunities: splitList(monster.condition_immunities).map(toReference),
    senses: mapSenses(monster.senses),
    languages: monster.languages || "--",
    challengeRating,
    proficiencyBonus: calculateProficiencyBonus(challengeRating),
    xp: CHALLENGE_RATING_XP.get(challengeRating) ?? 0,
    specialAbilities: mapActions(monster.special_abilities),
    actions: mapActions(monster.actions),
    legendaryActions: mapActions(monster.legendary_actions),
    image: normalizeOptionalString(monster.img_main),
    url: `https://api.open5e.com/v1/monsters/${monster.slug}/`,
    stats: {
      strength: monster.strength,
      dexterity: monster.dexterity,
      constitution: monster.constitution,
      intelligence: monster.intelligence,
      wisdom: monster.wisdom,
      charisma: monster.charisma,
    },
    desc: normalizeOptionalString(monster.desc),
    reactions: mapActions(monster.reactions),
    source: monster.document__title || monster.document__slug,
  };
}

export function buildOpen5eListUrl({ search, filters, offset }: BuildOpen5eListUrlArgs) {
  const url = new URL("https://api.open5e.com/v1/monsters/");
  url.searchParams.set("limit", "100");
  url.searchParams.set("ordering", "name");

  if (offset && offset > 0) {
    url.searchParams.set("offset", String(offset));
  }

  if (search) {
    url.searchParams.set("name__icontains", search);
  }

  for (const [key, value] of Object.entries(filters ?? {})) {
    if (!value) {
      continue;
    }

    if (key === "type" || key === "size") {
      url.searchParams.set(key, value);
    }

    if (key === "challengeRating") {
      url.searchParams.set("cr", value);
    }

    if (key === "source") {
      url.searchParams.set("document__slug", value);
    }
  }

  return url;
}

export function mergeBestiaryRows(
  open5eRows: BestiaryMonsterBase[],
  convexRows: BestiaryMonsterBase[]
) {
  return [...open5eRows, ...convexRows].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
  );
}

function normalizeOptionalString(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function mapSpeed(speed: Open5eMonster["speed"]): BestiaryMonster["speed"] {
  const mappedSpeed: BestiaryMonster["speed"] = {};

  for (const [key, value] of Object.entries(speed)) {
    if (key === "hover") {
      mappedSpeed.hover = Boolean(value);
      continue;
    }

    if (typeof value === "number") {
      setMappedSpeed(mappedSpeed, key, `${value} ft.`);
      continue;
    }

    if (typeof value === "string" && value.trim()) {
      setMappedSpeed(mappedSpeed, key, value);
    }
  }

  return mappedSpeed;
}

function setMappedSpeed(speed: BestiaryMonster["speed"], key: string, value: string) {
  if (isBestiarySpeedKey(key)) {
    speed[key] = value;
  }
}

function isBestiarySpeedKey(key: string): key is BestiarySpeedKey {
  return BESTIARY_SPEED_KEYS.has(key);
}

function mapSkillProficiencies(skills?: Record<string, number | null> | null) {
  return Object.entries(skills ?? {})
    .filter(([, value]) => typeof value === "number")
    .map(([name, value]) => {
      const displayName = name
        .split("_")
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join(" ");

      return {
        value: value ?? 0,
        proficiency: {
          index: `skill-${name.replaceAll("_", "-")}`,
          name: `Skill: ${displayName}`,
          url: "",
        },
      };
    });
}

function splitList(value?: string) {
  return (value ?? "")
    .split(/[,;]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toReference(name: string): BestiaryReference {
  return {
    index: name.toLowerCase().replaceAll(/\s+/g, "-"),
    name,
    url: "",
  };
}

function mapSenses(senses?: string): BestiaryMonster["senses"] {
  return {
    darkvision: matchSense(senses, "darkvision"),
    blindsight: matchSense(senses, "blindsight"),
    truesight: matchSense(senses, "truesight"),
    tremorsense: matchSense(senses, "tremorsense"),
    passivePerception: Number(senses?.match(/passive Perception\s+(\d+)/i)?.[1] ?? 10),
  };
}

function matchSense(senses: string | undefined, senseName: string) {
  return normalizeOptionalString(senses?.match(new RegExp(`${senseName}\\s+([^,]+)`, "i"))?.[1]);
}

function mapActions(actions?: Open5eAction[] | null): BestiaryAction[] | undefined {
  if (!actions?.length) {
    return undefined;
  }

  return actions.map((action) => ({
    name: action.name,
    desc: action.desc,
    attackBonus: action.attack_bonus,
  }));
}

function calculateProficiencyBonus(challengeRating: number) {
  if (challengeRating <= 4) {
    return 2;
  }

  return Math.ceil(challengeRating / 4) + 1;
}
