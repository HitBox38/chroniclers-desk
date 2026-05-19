import { NextResponse } from "next/server";
import {
  buildOpen5eItemListUrl,
  toOpen5eItemBase,
  type Open5eItemListItem,
} from "@/lib/items/open5e";
import { fetchOpen5eList, OPEN5E_CACHE_HEADERS, Open5eFetchError } from "@/lib/open5e/cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const filters = Object.fromEntries(searchParams.entries());
  delete filters.search;

  try {
    const items = await fetchOpen5eList<Open5eItemListItem, ReturnType<typeof toOpen5eItemBase>>({
      initialUrl: buildOpen5eItemListUrl({ search, filters }),
      mapResult: toOpen5eItemBase,
    });

    return NextResponse.json({ results: items }, { headers: OPEN5E_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load Open5e items." },
      { status: error instanceof Open5eFetchError ? error.status : 502 }
    );
  }
}
