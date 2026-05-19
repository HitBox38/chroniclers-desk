import { NextResponse } from "next/server";
import { toOpen5eItem, type Open5eItem } from "@/lib/items/open5e";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const response = await fetch(`https://api.open5e.com/v1/magicitems/${encodeURIComponent(slug)}/`, {
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to load Open5e item." }, { status: response.status });
  }

  const item = (await response.json()) as Open5eItem;
  return NextResponse.json(toOpen5eItem(item));
}
