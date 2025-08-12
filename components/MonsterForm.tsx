"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

const monsterFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  subtype: z.string().optional(),
  size: z.enum(["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"]),
  alignment: z.string().min(1, "Alignment is required"),
  challengeRating: z.number().min(0).max(30),
  hitPoints: z.number().min(1),
  armorClass: z.number().min(1),
  speed: z.string().min(1, "Speed is required"),
  strength: z.number().min(1).max(30),
  dexterity: z.number().min(1).max(30),
  constitution: z.number().min(1).max(30),
  intelligence: z.number().min(1).max(30),
  wisdom: z.number().min(1).max(30),
  charisma: z.number().min(1).max(30),
  languages: z.string().optional(),
  description: z.string().optional(),
});

type MonsterFormData = z.infer<typeof monsterFormSchema>;

interface MonsterFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MONSTER_TYPES = [
  "Aberration",
  "Beast",
  "Celestial",
  "Construct",
  "Dragon",
  "Elemental",
  "Fey",
  "Fiend",
  "Giant",
  "Humanoid",
  "Monstrosity",
  "Ooze",
  "Plant",
  "Undead",
];

const ALIGNMENTS = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
  "Unaligned",
];

const CHALLENGE_RATINGS = [
  0, 0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24, 25, 26, 27, 28, 29, 30,
];

export function MonsterForm({ onSuccess, onCancel }: MonsterFormProps) {
  const { user } = useUser();
  const createMonster = useMutation(api.monsters.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<MonsterFormData>({
    resolver: zodResolver(monsterFormSchema),
    defaultValues: {
      size: "Medium",
      challengeRating: 1,
      hitPoints: 10,
      armorClass: 10,
      speed: "30 ft.",
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
  });

  const onSubmit = async (data: MonsterFormData) => {
    if (!user) {
      toast.error("You must be signed in to create a monster");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMonster({
        ...data,
        userName: user.username ?? "Unknown",
        userId: user.id,
      });

      toast.success("Monster created successfully!");
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating monster:", error);
      toast.error("Failed to create monster. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAbilityModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="stats">Stats & Combat</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" {...register("name")} placeholder="Monster name" />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type">Type *</Label>
                  <select
                    id="type"
                    {...register("type")}
                    className="w-full px-3 py-2 text-sm border border-input bg-background ring-offset-background rounded-md focus:ring-2 focus:ring-ring focus:outline-none">
                    <option value="">Select type</option>
                    {MONSTER_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="subtype">Subtype</Label>
                <Input id="subtype" {...register("subtype")} placeholder="Optional subtype" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">Size *</Label>
                  <select
                    id="size"
                    {...register("size")}
                    className="w-full px-3 py-2 text-sm border border-input bg-background ring-offset-background rounded-md focus:ring-2 focus:ring-ring focus:outline-none">
                    {["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  {errors.size && (
                    <p className="text-sm text-red-500 mt-1">{errors.size.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="alignment">Alignment *</Label>
                  <select
                    id="alignment"
                    {...register("alignment")}
                    className="w-full px-3 py-2 text-sm border border-input bg-background ring-offset-background rounded-md focus:ring-2 focus:ring-ring focus:outline-none">
                    <option value="">Select alignment</option>
                    {ALIGNMENTS.map((alignment) => (
                      <option key={alignment} value={alignment}>
                        {alignment}
                      </option>
                    ))}
                  </select>
                  {errors.alignment && (
                    <p className="text-sm text-red-500 mt-1">{errors.alignment.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="languages">Languages</Label>
                <Input
                  id="languages"
                  {...register("languages")}
                  placeholder="Common, Draconic, etc."
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  {...register("description")}
                  placeholder="Monster description..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-input bg-background ring-offset-background rounded-md focus:ring-2 focus:ring-ring focus:outline-none resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Combat Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="challengeRating">Challenge Rating *</Label>
                  <select
                    id="challengeRating"
                    {...register("challengeRating", { valueAsNumber: true })}
                    className="w-full px-3 py-2 text-sm border border-input bg-background ring-offset-background rounded-md focus:ring-2 focus:ring-ring focus:outline-none">
                    {CHALLENGE_RATINGS.map((cr) => (
                      <option key={cr} value={cr}>
                        {cr}
                      </option>
                    ))}
                  </select>
                  {errors.challengeRating && (
                    <p className="text-sm text-red-500 mt-1">{errors.challengeRating.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="hitPoints">Hit Points *</Label>
                  <Input
                    id="hitPoints"
                    type="number"
                    {...register("hitPoints", { valueAsNumber: true })}
                    min={1}
                  />
                  {errors.hitPoints && (
                    <p className="text-sm text-red-500 mt-1">{errors.hitPoints.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="armorClass">Armor Class *</Label>
                  <Input
                    id="armorClass"
                    type="number"
                    {...register("armorClass", { valueAsNumber: true })}
                    min={1}
                  />
                  {errors.armorClass && (
                    <p className="text-sm text-red-500 mt-1">{errors.armorClass.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="speed">Speed *</Label>
                <Input id="speed" {...register("speed")} placeholder="30 ft." />
                {errors.speed && (
                  <p className="text-sm text-red-500 mt-1">{errors.speed.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ability Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: "strength", label: "Strength" },
                  { name: "dexterity", label: "Dexterity" },
                  { name: "constitution", label: "Constitution" },
                  { name: "intelligence", label: "Intelligence" },
                  { name: "wisdom", label: "Wisdom" },
                  { name: "charisma", label: "Charisma" },
                ].map(({ name, label }) => {
                  const fieldName = name as keyof MonsterFormData;
                  const score = (watch(fieldName) as number) || 10;
                  const modifier = calculateAbilityModifier(score);

                  return (
                    <div key={name}>
                      <Label htmlFor={name}>{label} *</Label>
                      <Input
                        id={name}
                        type="number"
                        {...register(fieldName, { valueAsNumber: true })}
                        min={1}
                        max={30}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Modifier: {formatModifier(modifier)}
                      </p>
                      {errors[fieldName] && (
                        <p className="text-sm text-red-500 mt-1">{errors[fieldName]?.message}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Monster"}
        </Button>
      </div>
    </form>
  );
}
