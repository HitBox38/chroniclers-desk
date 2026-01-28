"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useUser } from "@clerk/nextjs";

export function AddMonsterForm({ onSuccess }: { onSuccess?: () => void }) {
  const createMonster = useMutation(api.monsters.createUserMonster);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user) {
      console.error("User not authenticated");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    try {
      await createMonster({
        userId: user.id,
        id: `custom-${Date.now()}`,
        index: `custom-${formData.get("name")?.toString().toLowerCase().replace(/\s+/g, "-")}`,
        name: formData.get("name")?.toString() || "",
        type: formData.get("type")?.toString() || "",
        size: formData.get("size")?.toString() || "Medium",
        alignment: formData.get("alignment")?.toString() || "Unaligned",
        challengeRating: parseFloat(formData.get("challengeRating")?.toString() || "0"),
        proficiencyBonus: 2,
        xp: parseInt(formData.get("xp")?.toString() || "0"),
        stats: {
          strength: parseInt(formData.get("strength")?.toString() || "10"),
          dexterity: parseInt(formData.get("dexterity")?.toString() || "10"),
          constitution: parseInt(formData.get("constitution")?.toString() || "10"),
          intelligence: parseInt(formData.get("intelligence")?.toString() || "10"),
          wisdom: parseInt(formData.get("wisdom")?.toString() || "10"),
          charisma: parseInt(formData.get("charisma")?.toString() || "10"),
        },
        armorClass: [{
          type: "natural",
          value: parseInt(formData.get("armorClass")?.toString() || "10"),
        }],
        hitPoints: parseInt(formData.get("hitPoints")?.toString() || "10"),
        hitPointsRoll: formData.get("hitPointsRoll")?.toString() || "1d8",
        hitDice: formData.get("hitDice")?.toString() || "1d8",
        speed: {
          walk: formData.get("speed")?.toString() || "30 ft.",
        },
        damageVulnerabilities: [],
        damageResistances: [],
        damageImmunities: [],
        conditionImmunities: [],
        languages: formData.get("languages")?.toString() || "—",
        senses: {
          passivePerception: parseInt(formData.get("passivePerception")?.toString() || "10"),
        },
        url: "",
        desc: formData.get("description")?.toString() || "",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Failed to create monster:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Add New Monster</DrawerTitle>
        <DrawerDescription>
          Create a custom monster for your bestiary.
        </DrawerDescription>
      </DrawerHeader>
      <form onSubmit={handleSubmit} className="px-4">
        <div className="space-y-4 py-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required placeholder="Ancient Dragon" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Input id="type" name="type" required placeholder="Dragon" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <select
                id="size"
                name="size"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="Tiny">Tiny</option>
                <option value="Small">Small</option>
                <option value="Medium" selected>Medium</option>
                <option value="Large">Large</option>
                <option value="Huge">Huge</option>
                <option value="Gargantuan">Gargantuan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alignment">Alignment</Label>
              <Input id="alignment" name="alignment" placeholder="Chaotic Evil" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challengeRating">Challenge Rating</Label>
              <Input
                id="challengeRating"
                name="challengeRating"
                type="number"
                step="0.125"
                placeholder="1"
              />
            </div>
          </div>

          {/* Combat Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="armorClass">Armor Class</Label>
              <Input
                id="armorClass"
                name="armorClass"
                type="number"
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hitPoints">Hit Points</Label>
              <Input
                id="hitPoints"
                name="hitPoints"
                type="number"
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speed">Speed</Label>
              <Input id="speed" name="speed" placeholder="30 ft." />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hitDice">Hit Dice</Label>
            <Input id="hitDice" name="hitDice" placeholder="1d8" />
          </div>

          {/* Ability Scores */}
          <div>
            <Label>Ability Scores</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="space-y-1">
                <Label htmlFor="strength" className="text-xs">STR</Label>
                <Input
                  id="strength"
                  name="strength"
                  type="number"
                  placeholder="10"
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dexterity" className="text-xs">DEX</Label>
                <Input
                  id="dexterity"
                  name="dexterity"
                  type="number"
                  placeholder="10"
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="constitution" className="text-xs">CON</Label>
                <Input
                  id="constitution"
                  name="constitution"
                  type="number"
                  placeholder="10"
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="intelligence" className="text-xs">INT</Label>
                <Input
                  id="intelligence"
                  name="intelligence"
                  type="number"
                  placeholder="10"
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="wisdom" className="text-xs">WIS</Label>
                <Input
                  id="wisdom"
                  name="wisdom"
                  type="number"
                  placeholder="10"
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="charisma" className="text-xs">CHA</Label>
                <Input
                  id="charisma"
                  name="charisma"
                  type="number"
                  placeholder="10"
                  className="h-8"
                />
              </div>
            </div>
          </div>

          {/* Other Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="languages">Languages</Label>
              <Input id="languages" name="languages" placeholder="Common" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="xp">XP</Label>
              <Input id="xp" name="xp" type="number" placeholder="200" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passivePerception">Passive Perception</Label>
            <Input
              id="passivePerception"
              name="passivePerception"
              type="number"
              placeholder="10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              placeholder="A fearsome creature..."
            />
          </div>
        </div>

        <DrawerFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Monster"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </form>
    </DrawerContent>
  );
}