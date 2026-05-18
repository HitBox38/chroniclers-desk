"use client";

import { PageHeader } from "@/components/PageHeader";
import { SearchBox } from "@/components/SearchBox";
import { SPELL_FILTER_PROPERTIES } from "@/lib/spells/open5e";
import { useSearchParams } from "next/navigation";
import DataTable from "./data-table";
import SpellView from "./spellView";

export default function Spells() {
  const searchParams = useSearchParams();
  const spellId = searchParams.get("spellId");

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
    { label: "Spells", isCurrentPage: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Spells"
        description="Search and browse magical spells and abilities"
        breadcrumbItems={breadcrumbItems}
      />
      {spellId ? (
        <main className="px-4 pt-6 h-[calc(100vh-200px)]">
          <div className="grid h-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4">
            <section className="flex flex-col min-h-0">
              <SearchBox properties={SPELL_FILTER_PROPERTIES} selectedParamName="spellId" />
              <div className="h-full overflow-hidden">
                <DataTable />
              </div>
            </section>
            <div className="w-px bg-border" aria-hidden="true" />
            <section className="flex flex-col min-h-0">
              <div className="h-full overflow-hidden">
                <SpellView />
              </div>
            </section>
          </div>
        </main>
      ) : (
        <main className="px-4 pt-6 h-[calc(100vh-250px)]">
          <SearchBox properties={SPELL_FILTER_PROPERTIES} selectedParamName="spellId" />
          <div className="h-full w-full">
            <DataTable />
          </div>
        </main>
      )}
    </div>
  );
}
