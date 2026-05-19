import { NextResponse } from "next/server";
import { toOpen5eMonster, type Open5eMonster } from "@/lib/bestiary/open5e";
import { fetchOpen5eJson, OPEN5E_CACHE_HEADERS, Open5eFetchError } from "@/lib/open5e/cache";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const monster = await fetchOpen5eJson<Open5eMonster>(
      `https://api.open5e.com/v1/monsters/${encodeURIComponent(slug)}/`
    );

    return NextResponse.json(toOpen5eMonster(monster), { headers: OPEN5E_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load Open5e monster." },
      { status: error instanceof Open5eFetchError ? error.status : 502 }
    );
  }
}
