import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOpen5eListUrl,
  isOpen5eMonsterId,
  mergeBestiaryRows,
  toOpen5eMonster,
  toOpen5eMonsterBase,
} from "./open5e.ts";

test("maps an Open5e list result to the table row shape with a namespaced id", () => {
  const row = toOpen5eMonsterBase({
    slug: "a-mi-kuk",
    name: "A-mi-kuk",
    type: "Aberration",
    subtype: "",
    size: "Huge",
    hit_points: 115,
  });

  assert.deepEqual(row, {
    id: "open5e:a-mi-kuk",
    name: "A-mi-kuk",
    type: "Aberration",
    size: "Huge",
    hitPoints: 115,
  });
  assert.equal(isOpen5eMonsterId(row.id), true);
});

test("maps an Open5e detail result to the monster detail shape", () => {
  const monster = toOpen5eMonster({
    slug: "owlbear",
    name: "Owlbear",
    desc: "A terrible bear-owl hybrid.",
    size: "Large",
    type: "Monstrosity",
    subtype: "",
    alignment: "unaligned",
    armor_class: 13,
    armor_desc: "natural armor",
    hit_points: 59,
    hit_dice: "7d10+21",
    speed: { walk: 40 },
    strength: 20,
    dexterity: 12,
    constitution: 17,
    intelligence: 3,
    wisdom: 12,
    charisma: 7,
    skills: { perception: 3 },
    senses: "darkvision 60 ft., passive Perception 13",
    languages: "--",
    challenge_rating: "3",
    cr: 3,
    actions: [{ name: "Beak", desc: "Melee Weapon Attack." }],
    reactions: null,
    legendary_actions: null,
    special_abilities: null,
    document__slug: "srd",
    document__title: "Systems Reference Document",
  });

  assert.equal(monster.id, "open5e:owlbear");
  assert.equal(monster.source, "Systems Reference Document");
  assert.deepEqual(monster.armorClass, [{ type: "natural armor", value: 13 }]);
  assert.deepEqual(monster.speed, { walk: "40 ft." });
  assert.deepEqual(monster.stats, {
    strength: 20,
    dexterity: 12,
    constitution: 17,
    intelligence: 3,
    wisdom: 12,
    charisma: 7,
  });
  assert.equal(monster.senses.darkvision, "60 ft.");
  assert.equal(monster.senses.passivePerception, 13);
  assert.deepEqual(monster.proficiencies, [
    {
      value: 3,
      proficiency: {
        index: "skill-perception",
        name: "Skill: Perception",
        url: "",
      },
    },
  ]);
});

test("builds Open5e list URLs from supported bestiary search params", () => {
  const url = buildOpen5eListUrl({
    search: "owl",
    filters: {
      type: "Monstrosity",
      size: "Large",
      challengeRating: "3",
      source: "srd",
      unsupported: "ignored",
    },
  });

  assert.equal(url.searchParams.get("limit"), "100");
  assert.equal(url.searchParams.get("name__icontains"), "owl");
  assert.equal(url.searchParams.get("type"), "Monstrosity");
  assert.equal(url.searchParams.get("size"), "Large");
  assert.equal(url.searchParams.get("cr"), "3");
  assert.equal(url.searchParams.get("document__slug"), "srd");
  assert.equal(url.searchParams.has("unsupported"), false);
});

test("merges Open5e and Convex table rows in name order without changing ids", () => {
  const rows = mergeBestiaryRows(
    [
      { id: "open5e:zombie", name: "Zombie", type: "Undead", size: "Medium", hitPoints: 22 },
      { id: "open5e:aboleth", name: "Aboleth", type: "Aberration", size: "Large", hitPoints: 135 },
    ],
    [{ id: "custom-1", name: "Clockwork Ant", type: "Construct", size: "Tiny", hitPoints: 4 }]
  );

  assert.deepEqual(
    rows.map((row) => row.id),
    ["open5e:aboleth", "custom-1", "open5e:zombie"]
  );
});
