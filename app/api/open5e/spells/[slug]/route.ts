import { NextResponse } from "next/server";
import { toOpen5eSpell, type Open5eSpell } from "@/lib/spells/open5e";
import { fetchOpen5eJson, OPEN5E_CACHE_HEADERS, Open5eFetchError } from "@/lib/open5e/cache";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const spell = await fetchOpen5eJson<Open5eSpell>(
      `https://api.open5e.com/v1/spells/${encodeURIComponent(slug)}/`
    );

    return NextResponse.json(toOpen5eSpell(spell), { headers: OPEN5E_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load Open5e spell." },
      { status: error instanceof Open5eFetchError ? error.status : 502 }
    );
  }
}
