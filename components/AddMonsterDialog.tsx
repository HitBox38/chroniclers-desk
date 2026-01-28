"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MonsterForm } from "@/components/MonsterForm";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AddMonsterDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Only show the button when user is signed in */}
      <SignedIn>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Monster
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Add New Monster</DialogTitle>
              <DialogDescription>
                Create a custom monster for your campaign. Fill in the basic information and stats.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] px-6 pb-6">
              <MonsterForm onSuccess={handleSuccess} onCancel={handleCancel} />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </SignedIn>

      {/* Show sign-in prompt for signed-out users */}
      <SignedOut>
        <SignInButton mode="modal">
          <Button size="sm" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Monster
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
}