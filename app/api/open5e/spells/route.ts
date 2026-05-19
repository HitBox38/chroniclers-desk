import { NextResponse } from "next/server";
import {
  buildOpen5eSpellListUrl,
  toOpen5eSpellBase,
  type Open5eSpellListItem,
} from "@/lib/spells/open5e";
import { fetchOpen5eList, OPEN5E_CACHE_HEADERS, Open5eFetchError } from "@/lib/open5e/cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const filters = Object.fromEntries(searchParams.entries());
  delete filters.search;

  try {
    const spells = await fetchOpen5eList<Open5eSpellListItem, ReturnType<typeof toOpen5eSpellBase>>({
      initialUrl: buildOpen5eSpellListUrl({ search, filters }),
      mapResult: toOpen5eSpellBase,
    });

    return NextResponse.json({ results: spells }, { headers: OPEN5E_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load Open5e spells." },
      { status: error instanceof Open5eFetchError ? error.status : 502 }
    );
  }
}
