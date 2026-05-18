"use client";

import { useQuery as useReactQuery } from "@tanstack/react-query";
import { LoaderPinwheelIcon, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getOpen5eSpellSlugFromId } from "@/lib/spells/open5e";
import type { Spell } from "./type";

async function fetchOpen5eSpell(spellId: string) {
  const slug = getOpen5eSpellSlugFromId(spellId);
  const response = await fetch(`/api/open5e/spells/${encodeURIComponent(slug)}`);

  if (!response.ok) {
    throw new Error("Failed to load Open5e spell.");
  }

  return (await response.json()) as Spell;
}

export default function SpellView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const spellId = params.get("spellId");

  const open5eSpell = useReactQuery({
    queryKey: ["open5e-spell", spellId],
    queryFn: () => fetchOpen5eSpell(spellId!),
    enabled: !!spellId,
  });

  const handleClose = () => {
    const newParams = new URLSearchParams(params);
    newParams.delete("spellId");
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className="h-full flex flex-col">
      {open5eSpell.isPending ? (
        <div className="h-full flex items-center justify-center">
          <LoaderPinwheelIcon className="animate-spin" />
        </div>
      ) : open5eSpell.isError ? (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Unable to load selected Open5e spell.
        </div>
      ) : open5eSpell.data ? (
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex justify-between items-center scroll-m-20 border-b pb-2">
              <div>
                <CardTitle className="text-3xl font-semibold tracking-tight first:mt-0">
                  {open5eSpell.data.name}
                </CardTitle>
                <p className="text-muted-foreground">
                  {formatSpellLevel(open5eSpell.data.level, open5eSpell.data.school)}
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
                    <b>Casting Time:</b> {open5eSpell.data.castingTime}
                  </p>
                  <p className="leading-7">
                    <b>Range:</b> {open5eSpell.data.range}
                  </p>
                  <p className="leading-7">
                    <b>Components:</b> {open5eSpell.data.components.join(", ")}
                    {open5eSpell.data.material ? ` (${open5eSpell.data.material})` : null}
                  </p>
                  <p className="leading-7">
                    <b>Duration:</b>{" "}
                    {open5eSpell.data.requiresConcentration ? "Concentration, " : null}
                    {open5eSpell.data.duration}
                  </p>
                  <p className="leading-7">
                    <b>Classes:</b> {open5eSpell.data.classes.join(", ") || "--"}
                  </p>
                  {open5eSpell.data.canBeCastAsRitual ? (
                    <p className="leading-7">
                      <b>Ritual:</b> Yes
                    </p>
                  ) : null}
                </section>
                <section>
                  <p className="leading-7 whitespace-pre-line">{open5eSpell.data.desc}</p>
                </section>
                {open5eSpell.data.higherLevel ? (
                  <section>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                      At Higher Levels
                    </h3>
                    <p className="leading-7">{open5eSpell.data.higherLevel}</p>
                  </section>
                ) : null}
                {open5eSpell.data.archetype || open5eSpell.data.circles ? (
                  <section>
                    {open5eSpell.data.archetype ? (
                      <p className="leading-7">
                        <b>Archetype:</b> {open5eSpell.data.archetype}
                      </p>
                    ) : null}
                    {open5eSpell.data.circles ? (
                      <p className="leading-7">
                        <b>Circles:</b> {open5eSpell.data.circles}
                      </p>
                    ) : null}
                  </section>
                ) : null}
                <div className="flex flex-row-reverse">
                  <p className="leading-7 text-gray-500">
                    Source: {open5eSpell.data.source}
                    {open5eSpell.data.page ? ` (${open5eSpell.data.page})` : null}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function formatSpellLevel(level: number, school: string) {
  if (level === 0) {
    return `${school} cantrip`;
  }

  return `Level ${level} ${school}`;
}
