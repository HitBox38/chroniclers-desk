import { NextResponse } from "next/server";
import { toOpen5eItem, type Open5eItem } from "@/lib/items/open5e";
import { fetchOpen5eJson, OPEN5E_CACHE_HEADERS, Open5eFetchError } from "@/lib/open5e/cache";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const item = await fetchOpen5eJson<Open5eItem>(
      `https://api.open5e.com/v1/magicitems/${encodeURIComponent(slug)}/`
    );

    return NextResponse.json(toOpen5eItem(item), { headers: OPEN5E_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load Open5e item." },
      { status: error instanceof Open5eFetchError ? error.status : 502 }
    );
  }
}
