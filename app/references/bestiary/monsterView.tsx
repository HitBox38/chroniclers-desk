"use client";

import StatsTable from "@/components/StatsTable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { calculateStatModifier } from "@/lib/calculateStatModifier";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { LoaderPinwheelIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function MonsterView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const monsterId = params.get("monsterId");
  const { user } = useUser();

  const monster = useQuery(api.monsters.getById, monsterId ? { id: monsterId, userId: user?.id } : "skip");

  const isLoading = !!monsterId && monster === undefined;

  const handleClose = () => {
    const newParams = new URLSearchParams(params);
    newParams.delete("monsterId");
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className="h-full flex flex-col">
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <LoaderPinwheelIcon className="animate-spin" />
        </div>
      ) : monster ? (
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex justify-between items-center scroll-m-20 border-b pb-2">
              <CardTitle className="text-3xl font-semibold tracking-tight first:mt-0">
                {monster.name}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-4">
                <Tabs defaultValue="stats" className="flex flex-col gap-4">
                  {monster.desc ? (
                    <TabsList className={cn({ "grid grid-cols-2": !!monster.desc }, "w-full")}>
                      <TabsTrigger value="stats">Stat Block</TabsTrigger>
                      <TabsTrigger value="info">Info</TabsTrigger>
                    </TabsList>
                  ) : null}
                  <TabsContent value="stats" className="flex flex-col gap-4">
                    <section>
                      <p className="leading-7 capitalize italic">
                        {monster.size} {monster.type}
                        {monster.subtype ? ` (${monster.subtype})` : null}, {monster.alignment}
                      </p>
                      <div className="flex flex-row justify-between">
                        <p className="leading-7">
                          <b>Armor Class: </b>
                          {monster.armorClass.map((ac, index) => (
                            <span key={ac.type}>
                              {ac.value} ({ac.type})
                              {index !== monster?.armorClass.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </p>
                        <p className="leading-7">
                          <b>Initiative: </b>
                          {monster.initiative ?? calculateStatModifier(monster.stats.dexterity)}
                        </p>
                      </div>
                      <p className="leading-7">
                        <b>Hit Points: </b>
                        {monster.hitPoints} ({monster.hitPointsRoll})
                      </p>
                      <p className="leading-7">
                        <b>Speed: </b>
                        {Object.entries(monster.speed).map(([key, value], index) => (
                          <span key={key}>
                            <span className="capitalize">{key !== "walk" ? `${key}: ` : null}</span>
                            {value}
                            {index !== Object.entries(monster.speed).length - 1 ? ", " : null}
                          </span>
                        ))}
                      </p>
                    </section>
                    {monster.stats ? (
                      <StatsTable
                        stats={monster.stats}
                        proficiencyBonus={monster.proficiencyBonus}
                        savingThrowProficiencies={(monster.proficiencies ?? [])
                          .filter((p) => p.proficiency.name.includes("Saving Throw"))
                          .map((p) =>
                            p.proficiency.name.substring(p.proficiency.name.indexOf(": ") + 2)
                          )}
                      />
                    ) : null}
                    <section>
                      <p>
                        <b>Skills:</b>
                        {(monster.proficiencies ?? []).map((p, index) =>
                          p.proficiency.name.includes("Skill") ? (
                            <span key={p.proficiency.name}>
                              {p.proficiency.name.substring(p.proficiency.name.indexOf(" "))}{" "}
                              {p.value > 0 ? "+" : ""}
                              {p.value}
                              {index !== (monster.proficiencies ?? []).length - 1 ? ", " : ""}
                            </span>
                          ) : null
                        )}
                      </p>
                      <p>
                        <b>Senses:</b>{" "}
                        {monster.senses.darkvision
                          ? `Darkvision ${monster.senses.darkvision}`
                          : null}{" "}
                        {monster.senses.blindsight
                          ? `Blindsight ${monster.senses.blindsight}`
                          : null}{" "}
                        {monster.senses.truesight ? `Truesight ${monster.senses.truesight}` : null}{" "}
                        {monster.senses.tremorsense
                          ? `Tremorsense ${monster.senses.tremorsense}`
                          : null}{" "}
                        Passive Perception {monster.senses.passivePerception}
                      </p>
                      <p>
                        <b>Languages:</b> {monster.languages}
                      </p>
                      <p>
                        <b>CR:</b> {monster.challengeRating} (XP{" "}
                        {monster.xp.toLocaleString("en-us")}; PB{" "}
                        {monster.proficiencyBonus > 0
                          ? `+${monster.proficiencyBonus}`
                          : monster.proficiencyBonus}
                        )
                      </p>
                    </section>
                    <Accordion
                      type="multiple"
                      defaultValue={["traits", "actions", "reactions", "legendary-actions"]}>
                      {monster.specialAbilities && monster.specialAbilities.length ? (
                        <AccordionItem value="traits">
                          <AccordionTrigger>
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                              Traits
                            </h3>
                          </AccordionTrigger>
                          <AccordionContent>
                            {monster.specialAbilities?.map((sa, index) => (
                              <div key={index}>
                                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                  {sa.name}
                                </h4>
                                <p className="leading-7 pl-4">{sa.desc}</p>
                              </div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      ) : null}
                      {monster.actions && monster.actions.length ? (
                        <AccordionItem value="actions">
                          <AccordionTrigger>
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                              Actions
                            </h3>
                          </AccordionTrigger>
                          <AccordionContent>
                            {monster.actions?.map((a, index) => (
                              <div key={index}>
                                <div className="flex flex-row gap-2">
                                  <b className="text-xl">{a.name}</b>
                                  {a.usage ? (
                                    <p className="leading-7">
                                      {a.usage.times ? `${a.usage.times} times` : ""} {a.usage.type}
                                    </p>
                                  ) : null}
                                </div>
                                <p className="leading-7 pl-4">{a.desc}</p>
                              </div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      ) : null}
                      {monster.reactions && monster.reactions.length ? (
                        <AccordionItem value="reactions">
                          <AccordionTrigger>
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                              Reactions
                            </h3>
                          </AccordionTrigger>
                          <AccordionContent>
                            {monster.reactions?.map((r, index) => (
                              <div key={index}>
                                <b className="text-xl">{r.name}</b>
                                <p className="leading-7 pl-4">{r.desc}</p>
                              </div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      ) : null}
                      {monster.legendaryActions && monster.legendaryActions.length ? (
                        <AccordionItem value="legendary-actions">
                          <AccordionTrigger>
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                              Legendary Actions
                            </h3>
                          </AccordionTrigger>
                          <AccordionContent>
                            {monster.legendaryActions?.map((a, index) => (
                              <div key={index}>
                                <b className="text-xl">{a.name}</b>
                                <p className="leading-7 pl-4">{a.desc}</p>
                              </div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      ) : null}
                    </Accordion>
                  </TabsContent>
                  <TabsContent value="info">
                    <section>
                      <p className="leading-7">{monster.desc}</p>
                    </section>
                  </TabsContent>
                </Tabs>
                <div className="flex flex-row-reverse">
                  <p className="leading-7 text-gray-500">Source: {monster.source ?? "SRD"}</p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
