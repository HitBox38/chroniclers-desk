import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOpen5eItemListUrl,
  isOpen5eItemId,
  mergeItemRows,
  shouldShowItemTableLoading,
  toOpen5eItem,
  toOpen5eItemBase,
} from "./open5e.ts";

test("maps an Open5e magic item list result to the table row shape with a namespaced id", () => {
  const row = toOpen5eItemBase({
    slug: "bag-of-holding",
    name: "Bag of Holding",
    type: "Wondrous Item",
    desc: "This bag has an interior space considerably larger than its outside dimensions.",
    rarity: "uncommon",
    requires_attunement: "",
    document__slug: "wotc-srd",
    document__title: "5e Core Rules",
    document__url: "https://example.com/srd",
  });

  assert.deepEqual(row, {
    id: "open5e:bag-of-holding",
    name: "Bag of Holding",
    type: "Wondrous Item",
    rarity: "uncommon",
    requiresAttunement: undefined,
    source: "5e Core Rules",
  });
  assert.equal(isOpen5eItemId(row.id), true);
});

test("maps an Open5e magic item detail result to the item detail shape", () => {
  const item = toOpen5eItem({
    slug: "cloak-of-protection",
    name: "Cloak of Protection",
    type: "Wondrous Item",
    desc: "You gain a +1 bonus to AC and saving throws while you wear this cloak.",
    rarity: "uncommon",
    requires_attunement: "requires attunement",
    document__slug: "wotc-srd",
    document__title: "5e Core Rules",
    document__url: "https://example.com/srd",
  });

  assert.equal(item.id, "open5e:cloak-of-protection");
  assert.equal(item.source, "5e Core Rules");
  assert.equal(item.index, "cloak-of-protection");
  assert.equal(item.requiresAttunement, "requires attunement");
  assert.equal(item.url, "https://api.open5e.com/v1/magicitems/cloak-of-protection/");
  assert.equal(item.documentUrl, "https://example.com/srd");
});

test("builds Open5e list URLs from supported item search params", () => {
  const url = buildOpen5eItemListUrl({
    search: "cloak",
    filters: {
      type: "Wondrous Item",
      rarity: "uncommon",
      requiresAttunement: "requires attunement",
      source: "wotc-srd",
      unsupported: "ignored",
    },
  });

  assert.equal(url.searchParams.get("limit"), "100");
  assert.equal(url.searchParams.get("ordering"), "name");
  assert.equal(url.searchParams.get("name__icontains"), "cloak");
  assert.equal(url.searchParams.get("type"), "Wondrous Item");
  assert.equal(url.searchParams.get("rarity"), "uncommon");
  assert.equal(url.searchParams.get("requires_attunement"), "requires attunement");
  assert.equal(url.searchParams.get("document__slug"), "wotc-srd");
  assert.equal(url.searchParams.has("unsupported"), false);
});

test("merges Open5e and custom item rows in name order without changing ids", () => {
  const rows = mergeItemRows(
    [
      {
        id: "open5e:z",
        name: "Zephyr Blade",
        type: "Weapon",
        rarity: "rare",
        requiresAttunement: "requires attunement",
        source: "5e Core Rules",
      },
      {
        id: "open5e:a",
        name: "Amulet of Health",
        type: "Wondrous Item",
        rarity: "rare",
        requiresAttunement: "requires attunement",
        source: "5e Core Rules",
      },
    ],
    [
      {
        id: "custom-1",
        name: "Clockwork Compass",
        type: "Wondrous Item",
        rarity: "uncommon",
        requiresAttunement: undefined,
        source: "Homebrew",
      },
    ]
  );

  assert.deepEqual(
    rows.map((row) => row.id),
    ["open5e:a", "custom-1", "open5e:z"]
  );
});

test("does not block signed-out Open5e item rows while Clerk is still loading", () => {
  assert.equal(
    shouldShowItemTableLoading({
      isOpen5ePending: false,
      isSignedIn: undefined,
      customRowsLoaded: false,
    }),
    false
  );
});
