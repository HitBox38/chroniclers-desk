import { NextResponse } from "next/server";
import {
  buildOpen5eSpellListUrl,
  toOpen5eSpellBase,
  type Open5eSpellListItem,
} from "@/lib/spells/open5e";

interface Open5eSpellListResponse {
  next: string | null;
  results: Open5eSpellListItem[];
}

const MAX_OPEN5E_PAGES = 40;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const filters = Object.fromEntries(searchParams.entries());
  delete filters.search;

  const spells = [];
  let nextUrl: string | null = buildOpen5eSpellListUrl({ search, filters }).toString();
  let pageCount = 0;

  while (nextUrl && pageCount < MAX_OPEN5E_PAGES) {
    const response = await fetch(nextUrl, { next: { revalidate: 60 * 60 } });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to load Open5e spells." }, { status: response.status });
    }

    const page = (await response.json()) as Open5eSpellListResponse;
    spells.push(...page.results.map(toOpen5eSpellBase));
    nextUrl = page.next;
    pageCount += 1;
  }

  return NextResponse.json({ results: spells });
}
