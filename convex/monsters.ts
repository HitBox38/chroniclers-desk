import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {
    search: v.optional(v.string()),
    filters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    let monstersQuery;

    if (args.search) {
      monstersQuery = ctx.db
        .query("monsters")
        .withSearchIndex("search_name", (q) => q.search("name", args.search!));
    } else {
      monstersQuery = ctx.db.query("monsters");
    }

    if (args.filters) {
      for (const [key, value] of Object.entries(args.filters)) {
        monstersQuery = monstersQuery.filter((q) => q.eq(q.field(key as any), value as any));
      }
    }

    const monsters = await monstersQuery.collect();

    return monsters.map((monster) => ({
      id: monster.id,
      name: monster.name,
      type: monster.type,
      size: monster.size,
      hitPoints: monster.hitPoints,
    }));
  },
});

export const getById = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const monster = await ctx.db
      .query("monsters")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();
    return monster;
  },
});

export const getProperties = query({
  args: {},
  handler: async (ctx) => {
    // gets all known keys from the monsters table
    const properties = await ctx.db.query("monsters").collect();
    const keys = new Set<string>();
    properties.forEach((property) => {
      Object.keys(property).forEach((key) => {
        keys.add(key);
      });
    });
    return Array.from(keys);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    subtype: v.optional(v.string()),
    size: v.string(),
    alignment: v.string(),
    challengeRating: v.number(),
    hitPoints: v.number(),
    armorClass: v.number(),
    speed: v.string(),
    strength: v.number(),
    dexterity: v.number(),
    constitution: v.number(),
    intelligence: v.number(),
    wisdom: v.number(),
    charisma: v.number(),
    languages: v.optional(v.string()),
    description: v.optional(v.string()),
    userId: v.string(),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate a unique ID for the monster
    const id = `user-${args.userId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const index = args.name.toLowerCase().replace(/\s+/g, "-");

    // Calculate derived values
    const proficiencyBonus = Math.ceil(args.challengeRating / 4) + 1;
    const xp = getXPByCR(args.challengeRating);
    const hitDice = calculateHitDice(args.hitPoints, args.size);

    const monster = await ctx.db.insert("monsters", {
      id,
      index,
      name: args.name,
      type: args.type,
      subtype: args.subtype,
      size: args.size,
      alignment: args.alignment,
      challengeRating: args.challengeRating,
      proficiencyBonus,
      xp,
      stats: {
        strength: args.strength,
        dexterity: args.dexterity,
        constitution: args.constitution,
        intelligence: args.intelligence,
        wisdom: args.wisdom,
        charisma: args.charisma,
      },
      armorClass: [
        {
          type: "natural",
          value: args.armorClass,
        },
      ],
      hitPoints: args.hitPoints,
      hitPointsRoll: `${Math.floor(args.hitPoints / 8)}d8+${Math.floor(
        (args.constitution - 10) / 2
      )}`,
      hitDice,
      speed: {
        walk: args.speed,
      },
      damageVulnerabilities: [],
      damageResistances: [],
      damageImmunities: [],
      conditionImmunities: [],
      languages: args.languages || "",
      senses: {
        passivePerception: 10 + Math.floor((args.wisdom - 10) / 2),
      },
      url: `/monsters/${id}`,
      desc: args.description,
      source: args.userName,
      userId: args.userId,
      isUserCreated: true,
    });

    return monster;
  },
});

// Helper function to calculate XP by Challenge Rating
function getXPByCR(cr: number): number {
  const xpTable: Record<number, number> = {
    0: 10,
    0.125: 25,
    0.25: 50,
    0.5: 100,
    1: 200,
    2: 450,
    3: 700,
    4: 1100,
    5: 1800,
    6: 2300,
    7: 2900,
    8: 3900,
    9: 5000,
    10: 5900,
    11: 7200,
    12: 8400,
    13: 10000,
    14: 11500,
    15: 13000,
    16: 15000,
    17: 18000,
    18: 20000,
    19: 22000,
    20: 25000,
    21: 33000,
    22: 41000,
    23: 50000,
    24: 62000,
    25: 75000,
    26: 90000,
    27: 105000,
    28: 120000,
    29: 135000,
    30: 155000,
  };
  return xpTable[cr] || 10;
}

// Helper function to calculate hit dice based on size
function calculateHitDice(hitPoints: number, size: string): string {
  const hitDieBySize: Record<string, number> = {
    Tiny: 4,
    Small: 6,
    Medium: 8,
    Large: 10,
    Huge: 12,
    Gargantuan: 20,
  };

  const die = hitDieBySize[size] || 8;
  const numDice = Math.max(1, Math.floor(hitPoints / (die / 2 + 0.5)));
  return `${numDice}d${die}`;
}
