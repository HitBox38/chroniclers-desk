"use client";

import { useQuery as useReactQuery } from "@tanstack/react-query";
import { LoaderPinwheelIcon, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getOpen5eItemSlugFromId } from "@/lib/items/open5e";
import type { Item } from "./type";

async function fetchOpen5eItem(itemId: string) {
  const slug = getOpen5eItemSlugFromId(itemId);
  const response = await fetch(`/api/open5e/items/${encodeURIComponent(slug)}`);

  if (!response.ok) {
    throw new Error("Failed to load Open5e item.");
  }

  return (await response.json()) as Item;
}

export default function ItemView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const itemId = params.get("itemId");

  const open5eItem = useReactQuery({
    queryKey: ["open5e-item", itemId],
    queryFn: () => fetchOpen5eItem(itemId!),
    enabled: !!itemId,
  });

  const handleClose = () => {
    const newParams = new URLSearchParams(params);
    newParams.delete("itemId");
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className="h-full flex flex-col">
      {open5eItem.isPending ? (
        <div className="h-full flex items-center justify-center">
          <LoaderPinwheelIcon className="animate-spin" />
        </div>
      ) : open5eItem.isError ? (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Unable to load selected Open5e item.
        </div>
      ) : open5eItem.data ? (
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex justify-between items-center scroll-m-20 border-b pb-2">
              <div>
                <CardTitle className="text-3xl font-semibold tracking-tight first:mt-0">
                  {open5eItem.data.name}
                </CardTitle>
                <p className="text-muted-foreground">
                  {open5eItem.data.rarity} {open5eItem.data.type}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-4">
                <section className="grid gap-2">
                  <p className="leading-7">
                    <b>Type:</b> {open5eItem.data.type}
                  </p>
                  <p className="leading-7">
                    <b>Rarity:</b> {open5eItem.data.rarity || "--"}
                  </p>
                  <p className="leading-7">
                    <b>Attunement:</b> {open5eItem.data.requiresAttunement || "Not required"}
                  </p>
                </section>
                <section>
                  <p className="leading-7 whitespace-pre-line">{open5eItem.data.desc}</p>
                </section>
                <div className="flex flex-row-reverse">
                  <p className="leading-7 text-gray-500">Source: {open5eItem.data.source}</p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
