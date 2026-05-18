import { NextResponse } from "next/server";
import { toOpen5eSpell, type Open5eSpell } from "@/lib/spells/open5e";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const response = await fetch(`https://api.open5e.com/v1/spells/${encodeURIComponent(slug)}/`, {
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to load Open5e spell." }, { status: response.status });
  }

  const spell = (await response.json()) as Open5eSpell;
  return NextResponse.json(toOpen5eSpell(spell));
}
