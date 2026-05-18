"use client";

import { PageHeader } from "@/components/PageHeader";
import DataTable from "./data-table";
import MonsterView from "./monsterView";
import { useSearchParams } from "next/navigation";
import { SearchBox } from "@/components/SearchBox";
import { BESTIARY_FILTER_PROPERTIES } from "@/lib/bestiary/open5e";

export default function Bestiary() {
  const searchParams = useSearchParams();
  const monsterId = searchParams.get("monsterId");

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
        <main className="px-4 pt-6 h-[calc(100vh-200px)]">
          <div className="grid h-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4">
            <section className="flex flex-col min-h-0">
              <SearchBox properties={BESTIARY_FILTER_PROPERTIES} />
              <div className="h-full overflow-hidden">
                <DataTable />
              </div>
            </section>
            <div className="w-px bg-border" aria-hidden="true" />
            <section className="flex flex-col min-h-0">
              <div className="h-full overflow-hidden">
                <MonsterView />
              </div>
            </section>
          </div>
        </main>
      ) : (
        <main className="px-4 pt-6 h-[calc(100vh-250px)]">
          <SearchBox properties={BESTIARY_FILTER_PROPERTIES} />
          <div className="h-full w-full">
            <DataTable />
          </div>
        </main>
      )}
    </div>
  );
}
