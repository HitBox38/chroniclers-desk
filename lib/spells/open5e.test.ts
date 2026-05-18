import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOpen5eSpellListUrl,
  isOpen5eSpellId,
  mergeSpellRows,
  shouldShowSpellTableLoading,
  toOpen5eSpell,
  toOpen5eSpellBase,
} from "./open5e.ts";

test("maps an Open5e spell list result to the table row shape with a namespaced id", () => {
  const row = toOpen5eSpellBase({
    slug: "acid-arrow",
    name: "Acid Arrow",
    level_int: 2,
    school: "Evocation",
    casting_time: "1 action",
    range: "90 feet",
    dnd_class: "Druid, Wizard",
    document__slug: "wotc-srd",
    document__title: "5e Core Rules",
  });

  assert.deepEqual(row, {
    id: "open5e:acid-arrow",
    name: "Acid Arrow",
    level: 2,
    school: "Evocation",
    castingTime: "1 action",
    range: "90 feet",
    classes: ["Druid", "Wizard"],
    source: "5e Core Rules",
  });
  assert.equal(isOpen5eSpellId(row.id), true);
});

test("maps an Open5e spell detail result to the spell detail shape", () => {
  const spell = toOpen5eSpell({
    slug: "acid-arrow",
    name: "Acid Arrow",
    desc: "A shimmering green arrow streaks toward a target within range.",
    higher_level:
      "When you cast this spell using a spell slot of 3rd level or higher, the damage increases.",
    page: "phb 259",
    range: "90 feet",
    target_range_sort: 90,
    components: "V, S, M",
    requires_verbal_components: true,
    requires_somatic_components: true,
    requires_material_components: true,
    material: "Powdered rhubarb leaf and an adder's stomach.",
    can_be_cast_as_ritual: false,
    ritual: "no",
    duration: "Instantaneous",
    concentration: "no",
    requires_concentration: false,
    casting_time: "1 action",
    level: "2nd-level",
    level_int: 2,
    spell_level: 2,
    school: "Evocation",
    dnd_class: "Druid, Wizard",
    spell_lists: ["druid", "wizard"],
    archetype: "Druid: Swamp",
    circles: "Swamp",
    document__slug: "wotc-srd",
    document__title: "5e Core Rules",
    document__license_url: "http://open5e.com/legal",
    document__url: "http://dnd.wizards.com/articles/features/systems-reference-document-srd",
  });

  assert.equal(spell.id, "open5e:acid-arrow");
  assert.equal(spell.source, "5e Core Rules");
  assert.equal(spell.levelLabel, "2nd-level");
  assert.deepEqual(spell.components, ["V", "S", "M"]);
  assert.deepEqual(spell.classes, ["Druid", "Wizard"]);
  assert.equal(spell.requiresConcentration, false);
  assert.equal(spell.canBeCastAsRitual, false);
  assert.equal(spell.url, "https://api.open5e.com/v1/spells/acid-arrow/");
});

test("builds Open5e list URLs from supported spell search params", () => {
  const url = buildOpen5eSpellListUrl({
    search: "acid",
    filters: {
      level: "2",
      school: "Evocation",
      class: "Wizard",
      source: "wotc-srd",
      unsupported: "ignored",
    },
  });

  assert.equal(url.searchParams.get("limit"), "100");
  assert.equal(url.searchParams.get("ordering"), "name");
  assert.equal(url.searchParams.get("name__icontains"), "acid");
  assert.equal(url.searchParams.get("spell_level"), "2");
  assert.equal(url.searchParams.get("school"), "Evocation");
  assert.equal(url.searchParams.get("dnd_class__icontains"), "Wizard");
  assert.equal(url.searchParams.get("document__slug"), "wotc-srd");
  assert.equal(url.searchParams.has("unsupported"), false);
});

test("merges Open5e and custom spell rows in name order without changing ids", () => {
  const rows = mergeSpellRows(
    [
      {
        id: "open5e:z",
        name: "Zephyr Strike",
        level: 1,
        school: "Transmutation",
        castingTime: "1 bonus action",
        range: "Self",
        classes: ["Ranger"],
        source: "5e Core Rules",
      },
      {
        id: "open5e:a",
        name: "Acid Arrow",
        level: 2,
        school: "Evocation",
        castingTime: "1 action",
        range: "90 feet",
        classes: ["Wizard"],
        source: "5e Core Rules",
      },
    ],
    [
      {
        id: "custom-1",
        name: "Clockwork Spark",
        level: 0,
        school: "Evocation",
        castingTime: "1 action",
        range: "30 feet",
        classes: ["Artificer"],
        source: "Homebrew",
      },
    ]
  );

  assert.deepEqual(
    rows.map((row) => row.id),
    ["open5e:a", "custom-1", "open5e:z"]
  );
});

test("does not block signed-out Open5e spell rows while Clerk is still loading", () => {
  assert.equal(
    shouldShowSpellTableLoading({
      isOpen5ePending: false,
      isSignedIn: undefined,
      customRowsLoaded: false,
    }),
    false
  );
});
