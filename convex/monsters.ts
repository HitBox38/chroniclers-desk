import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

type MonsterField = Extract<keyof Doc<"monsters">, string>;

export const get = query({
  args: {
    search: v.optional(v.string()),
    filters: v.optional(v.record(v.string(), v.string())),
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
        monstersQuery = monstersQuery.filter((q) => q.eq(q.field(key as MonsterField), value));
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
