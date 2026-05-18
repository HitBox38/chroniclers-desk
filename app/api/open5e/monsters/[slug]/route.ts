import { NextResponse } from "next/server";
import { toOpen5eMonster, type Open5eMonster } from "@/lib/bestiary/open5e";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const response = await fetch(`https://api.open5e.com/v1/monsters/${encodeURIComponent(slug)}/`, {
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to load Open5e monster." },
      { status: response.status }
    );
  }

  const monster = (await response.json()) as Open5eMonster;
  return NextResponse.json(toOpen5eMonster(monster));
}
