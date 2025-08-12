import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const referenceObject = v.object({
  index: v.string(),
  name: v.string(),
  url: v.string(),
});

const dcObject = v.object({
  dcType: referenceObject,
  dcValue: v.number(),
  successType: v.string(),
});

const usageObject = v.object({
  type: v.string(),
  times: v.optional(v.number()),
  dice: v.optional(v.string()),
  minValue: v.optional(v.number()),
  restTypes: v.optional(v.array(v.string())),
});

const actionActionObject = v.object({
  actionName: v.string(),
  count: v.union(v.number(), v.string()),
  type: v.string(),
});

const damageFromOptionObject = v.object({
  optionType: v.string(),
  damageType: referenceObject,
  damageDice: v.string(),
  notes: v.optional(v.string()),
});

const damageFromObject = v.object({
  optionSetType: v.string(),
  options: v.array(damageFromOptionObject),
});

const actionDamageObject = v.object({
  damageType: v.optional(referenceObject),
  damageDice: v.optional(v.string()),
  dc: v.optional(dcObject),
  choose: v.optional(v.number()),
  type: v.optional(v.string()),
  from: v.optional(damageFromObject),
});

const attackObject = v.object({
  name: v.string(),
  dc: dcObject,
  damage: v.optional(
    v.array(
      v.object({
        damageType: referenceObject,
        damageDice: v.string(),
      })
    )
  ),
});

const tentacledOptionObject = v.object({
  optionType: v.string(),
  name: v.string(),
  dc: dcObject,
  damage: v.optional(
    v.array(
      v.object({
        damageType: referenceObject,
        damageDice: v.string(),
      })
    )
  ),
});

const optionsFromObject = v.object({
  optionSetType: v.string(),
  options: v.array(tentacledOptionObject),
});

const optionsObject = v.object({
  choose: v.number(),
  type: v.string(),
  from: optionsFromObject,
});

const itemObject = v.object({
  optionType: v.string(),
  actionName: v.string(),
  count: v.union(v.number(), v.string()),
  type: v.string(),
  desc: v.optional(v.string()),
});

const purpleOptionObject = v.object({
  optionType: v.string(),
  items: v.optional(v.array(itemObject)),
  actionName: v.optional(v.string()),
  count: v.optional(v.union(v.number(), v.string())),
  type: v.optional(v.string()),
  desc: v.optional(v.string()),
});

const actionOptionsFromObject = v.object({
  optionSetType: v.string(),
  options: v.array(purpleOptionObject),
});

const actionOptionsObject = v.object({
  choose: v.number(),
  type: v.string(),
  from: actionOptionsFromObject,
});

const monsterActionObject = v.object({
  name: v.string(),
  multiattackType: v.optional(v.string()),
  desc: v.string(),
  actions: v.optional(v.array(actionActionObject)),
  attackBonus: v.optional(v.number()),
  dc: v.optional(dcObject),
  damage: v.optional(v.array(actionDamageObject)),
  usage: v.optional(usageObject),
  options: v.optional(optionsObject),
  attacks: v.optional(v.array(attackObject)),
  actionOptions: v.optional(actionOptionsObject),
});

const legendaryActionObject = v.object({
  name: v.string(),
  desc: v.string(),
  attackBonus: v.optional(v.number()),
  damage: v.optional(
    v.array(
      v.object({
        damageType: referenceObject,
        damageDice: v.string(),
      })
    )
  ),
  dc: v.optional(dcObject),
});

const spellUsageObject = v.object({
  type: v.string(),
  times: v.optional(v.number()),
});
const spellObject = v.object({
  name: v.string(),
  level: v.number(),
  url: v.string(),
  usage: v.optional(spellUsageObject),
  notes: v.optional(v.string()),
});
const spellcastingObject = v.object({
  level: v.optional(v.number()),
  ability: referenceObject,
  dc: v.optional(v.number()),
  modifier: v.optional(v.number()),
  componentsRequired: v.array(v.string()),
  school: v.optional(v.string()),
  slots: v.optional(v.record(v.string(), v.number())),
  spells: v.array(spellObject),
});

const specialAbilityUsageObject = v.object({
  type: v.string(),
  times: v.optional(v.number()),
  restTypes: v.optional(v.array(v.string())),
});

const specialAbilityObject = v.object({
  name: v.string(),
  desc: v.string(),
  dc: v.optional(dcObject),
  spellcasting: v.optional(spellcastingObject),
  usage: v.optional(specialAbilityUsageObject),
  damage: v.optional(
    v.array(
      v.object({
        damageType: referenceObject,
        damageDice: v.string(),
      })
    )
  ),
  attackBonus: v.optional(v.number()),
});

const proficiencyObject = v.object({
  value: v.number(),
  proficiency: referenceObject,
});

const reactionObject = v.object({
  name: v.string(),
  desc: v.string(),
  dc: v.optional(dcObject),
});

const sensesObject = v.object({
  darkvision: v.optional(v.string()),
  passivePerception: v.number(),
  blindsight: v.optional(v.string()),
  truesight: v.optional(v.string()),
  tremorsense: v.optional(v.string()),
});

const speedObject = v.object({
  walk: v.optional(v.string()),
  swim: v.optional(v.string()),
  fly: v.optional(v.string()),
  burrow: v.optional(v.string()),
  climb: v.optional(v.string()),
  hover: v.optional(v.boolean()),
});

const statsObject = v.object({
  strength: v.number(),
  dexterity: v.number(),
  constitution: v.number(),
  intelligence: v.number(),
  wisdom: v.number(),
  charisma: v.number(),
});

const armorClassObject = v.object({
  type: v.string(),
  value: v.number(),
  desc: v.optional(v.string()),
  armor: v.optional(v.array(referenceObject)),
  spell: v.optional(referenceObject),
  condition: v.optional(referenceObject),
});

export default defineSchema({
  monsters: defineTable({
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
    stats: statsObject,
    armorClass: v.array(armorClassObject),
    hitPoints: v.number(),
    hitPointsRoll: v.string(),
    hitDice: v.string(),
    speed: speedObject,
    damageVulnerabilities: v.array(v.string()),
    damageResistances: v.array(v.string()),
    damageImmunities: v.array(v.string()),
    conditionImmunities: v.array(referenceObject),
    languages: v.string(),
    senses: sensesObject,
    image: v.optional(v.string()),
    url: v.string(),
    desc: v.optional(v.string()),
    source: v.optional(v.string()),
    initiative: v.optional(v.number()),
    actions: v.optional(v.array(monsterActionObject)),
    legendaryActions: v.optional(v.array(legendaryActionObject)),
    proficiencies: v.optional(v.array(proficiencyObject)),
    specialAbilities: v.optional(v.array(specialAbilityObject)),
    reactions: v.optional(v.array(reactionObject)),
    forms: v.optional(v.array(referenceObject)),
    // New field for user-created monsters
    userId: v.optional(v.string()),
    isUserCreated: v.optional(v.boolean()),
  })
    .index("by_name", ["name"])
    .index("by_string_id", ["id"])
    .index("by_user_id", ["userId"])
    .searchIndex("search_name", {
      searchField: "name",
    })
    .searchIndex("search_type", {
      searchField: "type",
    }),
});
