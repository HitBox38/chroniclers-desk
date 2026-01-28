"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { PageHeader } from "@/components/PageHeader";
import DataTable from "./data-table";
import MonsterView from "./monsterView";
import { useSearchParams } from "next/navigation";
import { SearchBox } from "@/components/SearchBox";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { AddMonsterForm } from "./AddMonsterForm";
import { useState } from "react";

export default function Bestiary() {
  const searchParams = useSearchParams();
  const monsterId = searchParams.get("monsterId");
  const properties = useQuery(api.monsters.getProperties);
  const { isSignedIn } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    {
      label: "References",
      href: "/references",
      dropdownOptions: [
        {
          label: "Bestiary",
          href: "/references/bestiary",
          description: "Browse monsters and creatures",
        },
        {
          label: "Spells",
          href: "/references/spells",
          description: "Search magical spells and abilities",
        },
        {
          label: "Items",
          href: "/references/items",
          description: "Discover magical items and equipment",
        },
      ],
    },
    { label: "Bestiary", isCurrentPage: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Bestiary"
        description="Browse and search through monsters and creatures"
        breadcrumbItems={breadcrumbItems}
      />
      {monsterId ? (
        // Two-panel layout when a monster is selected
        <main className="mx-auto px-4 pt-6 h-[calc(100vh-200px)]">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} className="flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-4">
                <SearchBox properties={properties} />
                {isSignedIn && (
                  <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <DrawerTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Monster
                      </Button>
                    </DrawerTrigger>
                    <AddMonsterForm onSuccess={() => setDrawerOpen(false)} />
                  </Drawer>
                )}
              </div>
              <div className="h-full overflow-hidden">
                <DataTable />
              </div>
            </ResizablePanel>
            <ResizableHandle className="mx-4" withHandle />
            <ResizablePanel defaultSize={50} className="flex flex-col min-h-0">
              <div className="h-full overflow-hidden">
                <MonsterView />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      ) : (
        <main className="px-4 pt-6 h-[calc(100vh-250px)]">
          <div className="flex items-center gap-2 mb-4">
            <SearchBox properties={properties} />
            {isSignedIn && (
              <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Monster
                  </Button>
                </DrawerTrigger>
                <AddMonsterForm onSuccess={() => setDrawerOpen(false)} />
              </Drawer>
            )}
          </div>
          <div className="h-full w-full">
            <DataTable />
          </div>
        </main>
      )}
    </div>
  );
}
