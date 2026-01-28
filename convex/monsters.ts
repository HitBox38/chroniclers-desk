import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {
    search: v.optional(v.string()),
    filters: v.optional(v.any()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let monstersQuery;
    let userMonstersQuery;

    // Query base monsters
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
    const baseMonstersResult = monsters.map((monster) => ({
      id: monster.id,
      name: monster.name,
      type: monster.type,
      size: monster.size,
      hitPoints: monster.hitPoints,
      isUserCreated: false,
    }));

    // If userId is provided, also query their custom monsters
    if (args.userId) {
      if (args.search) {
        userMonstersQuery = ctx.db
          .query("userMonsters")
          .withSearchIndex("search_user_monster_name", (q) => 
            q.search("name", args.search!).eq("userId", args.userId!)
          );
      } else {
        userMonstersQuery = ctx.db
          .query("userMonsters")
          .withIndex("by_user", (q) => q.eq("userId", args.userId!));
      }

      if (args.filters) {
        for (const [key, value] of Object.entries(args.filters)) {
          if (key !== "userId") {
            userMonstersQuery = userMonstersQuery.filter((q) => q.eq(q.field(key as any), value as any));
          }
        }
      }

      const userMonsters = await userMonstersQuery.collect();
      const userMonstersResult = userMonsters.map((monster) => ({
        id: monster.id,
        name: monster.name,
        type: monster.type,
        size: monster.size,
        hitPoints: monster.hitPoints,
        isUserCreated: true,
      }));

      // Combine both results
      return [...baseMonstersResult, ...userMonstersResult];
    }

    return baseMonstersResult;
  },
});

export const getById = query({
  args: {
    id: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // First try to find in base monsters
    const monster = await ctx.db
      .query("monsters")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();
    
    if (monster) {
      return { ...monster, isUserCreated: false };
    }
    
    // If not found and userId is provided, check user monsters
    if (args.userId) {
      const userMonster = await ctx.db
        .query("userMonsters")
        .filter((q) => 
          q.and(
            q.eq(q.field("id"), args.id),
            q.eq(q.field("userId"), args.userId)
          )
        )
        .first();
      
      if (userMonster) {
        return { ...userMonster, isUserCreated: true };
      }
    }
    
    return null;
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

export const createUserMonster = mutation({
  args: {
    userId: v.string(),
    id: v.string(),
    index: v.string(),
    name: v.string(),
    type: v.string(),
    subtype: v.optional(v.string()),
    size: v.string(),
    alignment: v.string(),
    challengeRating: v.number(),
    proficiencyBonus: v.number(),
    xp: v.number(),
    stats: v.object({
      strength: v.number(),
      dexterity: v.number(),
      constitution: v.number(),
      intelligence: v.number(),
      wisdom: v.number(),
      charisma: v.number(),
    }),
    armorClass: v.array(v.object({
      type: v.string(),
      value: v.number(),
      desc: v.optional(v.string()),
      armor: v.optional(v.array(v.object({
        index: v.string(),
        name: v.string(),
        url: v.string(),
      }))),
      spell: v.optional(v.object({
        index: v.string(),
        name: v.string(),
        url: v.string(),
      })),
      condition: v.optional(v.object({
        index: v.string(),
        name: v.string(),
        url: v.string(),
      })),
    })),
    hitPoints: v.number(),
    hitPointsRoll: v.string(),
    hitDice: v.string(),
    speed: v.object({
      walk: v.optional(v.string()),
      swim: v.optional(v.string()),
      fly: v.optional(v.string()),
      burrow: v.optional(v.string()),
      climb: v.optional(v.string()),
      hover: v.optional(v.boolean()),
    }),
    damageVulnerabilities: v.array(v.string()),
    damageResistances: v.array(v.string()),
    damageImmunities: v.array(v.string()),
    conditionImmunities: v.array(v.object({
      index: v.string(),
      name: v.string(),
      url: v.string(),
    })),
    languages: v.string(),
    senses: v.object({
      darkvision: v.optional(v.string()),
      passivePerception: v.number(),
      blindsight: v.optional(v.string()),
      truesight: v.optional(v.string()),
      tremorsense: v.optional(v.string()),
    }),
    image: v.optional(v.string()),
    url: v.string(),
    desc: v.optional(v.string()),
    source: v.optional(v.string()),
    initiative: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Insert the monster with the provided userId
    const id = await ctx.db.insert("userMonsters", args);
    return id;
  },
});
