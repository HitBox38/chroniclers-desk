import { NextResponse } from "next/server";
import {
  buildOpen5eListUrl,
  toOpen5eMonsterBase,
  type Open5eMonsterListItem,
} from "@/lib/bestiary/open5e";
import { fetchOpen5eList, OPEN5E_CACHE_HEADERS, Open5eFetchError } from "@/lib/open5e/cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const filters = Object.fromEntries(searchParams.entries());
  delete filters.search;

  try {
    const monsters = await fetchOpen5eList<Open5eMonsterListItem, ReturnType<typeof toOpen5eMonsterBase>>({
      initialUrl: buildOpen5eListUrl({ search, filters }),
      mapResult: toOpen5eMonsterBase,
    });

    return NextResponse.json({ results: monsters }, { headers: OPEN5E_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load Open5e monsters." },
      { status: error instanceof Open5eFetchError ? error.status : 502 }
    );
  }
}
