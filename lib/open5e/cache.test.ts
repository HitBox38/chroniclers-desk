import assert from "node:assert/strict";
import test from "node:test";

import {
  clearOpen5eResponseCache,
  fetchOpen5eJson,
  fetchOpen5eList,
} from "./cache.ts";

test("reuses cached Open5e responses and dedupes concurrent requests", async () => {
  clearOpen5eResponseCache();

  let calls = 0;
  const fetchFn: typeof fetch = async () => {
    calls += 1;
    return Response.json({ value: calls });
  };

  const url = "https://api.open5e.com/v1/spells/?limit=100";
  const [first, second] = await Promise.all([
    fetchOpen5eJson<{ value: number }>(url, { fetchFn }),
    fetchOpen5eJson<{ value: number }>(url, { fetchFn }),
  ]);
  const third = await fetchOpen5eJson<{ value: number }>(url, { fetchFn });

  assert.deepEqual(first, { value: 1 });
  assert.deepEqual(second, { value: 1 });
  assert.deepEqual(third, { value: 1 });
  assert.equal(calls, 1);
});

test("loads remaining Open5e list pages in parallel when count is available", async () => {
  clearOpen5eResponseCache();

  const fetchedOffsets: number[] = [];
  const fetchFn: typeof fetch = async (input) => {
    const url = new URL(String(input));
    const offset = Number(url.searchParams.get("offset") ?? "0");
    fetchedOffsets.push(offset);

    return Response.json({
      count: 250,
      next: offset === 200 ? null : "https://api.open5e.com/v1/monsters/",
      results: [{ offset }],
    });
  };

  const results = await fetchOpen5eList({
    initialUrl: new URL("https://api.open5e.com/v1/monsters/?limit=100"),
    fetchFn,
    mapResult: (result: { offset: number }) => result.offset,
  });

  assert.deepEqual(results, [0, 100, 200]);
  assert.deepEqual(fetchedOffsets, [0, 100, 200]);
});
