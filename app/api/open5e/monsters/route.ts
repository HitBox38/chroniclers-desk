import { NextResponse } from "next/server";
import {
  buildOpen5eListUrl,
  toOpen5eMonsterBase,
  type Open5eMonsterListItem,
} from "@/lib/bestiary/open5e";

interface Open5eListResponse {
  next: string | null;
  results: Open5eMonsterListItem[];
}

const MAX_OPEN5E_PAGES = 40;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const filters = Object.fromEntries(searchParams.entries());
  delete filters.search;

  const monsters = [];
  let nextUrl: string | null = buildOpen5eListUrl({ search, filters }).toString();
  let pageCount = 0;

  while (nextUrl && pageCount < MAX_OPEN5E_PAGES) {
    const response = await fetch(nextUrl, { next: { revalidate: 60 * 60 } });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to load Open5e monsters." },
        { status: response.status }
      );
    }

    const page = (await response.json()) as Open5eListResponse;
    monsters.push(...page.results.map(toOpen5eMonsterBase));
    nextUrl = page.next;
    pageCount += 1;
  }

  return NextResponse.json({ results: monsters });
}
