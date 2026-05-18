import { NextResponse } from "next/server";
import {
  buildOpen5eItemListUrl,
  toOpen5eItemBase,
  type Open5eItemListItem,
} from "@/lib/items/open5e";

interface Open5eItemListResponse {
  next: string | null;
  results: Open5eItemListItem[];
}

const MAX_OPEN5E_PAGES = 40;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const filters = Object.fromEntries(searchParams.entries());
  delete filters.search;

  const items = [];
  let nextUrl: string | null = buildOpen5eItemListUrl({ search, filters }).toString();
  let pageCount = 0;

  while (nextUrl && pageCount < MAX_OPEN5E_PAGES) {
    const response = await fetch(nextUrl, { next: { revalidate: 60 * 60 } });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to load Open5e items." },
        { status: response.status }
      );
    }

    const page = (await response.json()) as Open5eItemListResponse;
    items.push(...page.results.map(toOpen5eItemBase));
    nextUrl = page.next;
    pageCount += 1;
  }

  return NextResponse.json({ results: items });
}
