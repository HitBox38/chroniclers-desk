"use client";

import { PageHeader } from "@/components/PageHeader";
import { SearchBox } from "@/components/SearchBox";
import { ITEM_FILTER_PROPERTIES } from "@/lib/items/open5e";
import { useSearchParams } from "next/navigation";
import DataTable from "./data-table";
import ItemView from "./itemView";

export default function Items() {
  const searchParams = useSearchParams();
  const itemId = searchParams.get("itemId");

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
    { label: "Items", isCurrentPage: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Items"
        description="Discover magical items and equipment"
        breadcrumbItems={breadcrumbItems}
      />
      {itemId ? (
        <main className="px-4 pt-6 h-[calc(100vh-200px)]">
          <div className="grid h-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4">
            <section className="flex flex-col min-h-0">
              <SearchBox properties={ITEM_FILTER_PROPERTIES} selectedParamName="itemId" />
              <div className="h-full overflow-hidden">
                <DataTable />
              </div>
            </section>
            <div className="w-px bg-border" aria-hidden="true" />
            <section className="flex flex-col min-h-0">
              <div className="h-full overflow-hidden">
                <ItemView />
              </div>
            </section>
          </div>
        </main>
      ) : (
        <main className="px-4 pt-6 h-[calc(100vh-250px)]">
          <SearchBox properties={ITEM_FILTER_PROPERTIES} selectedParamName="itemId" />
          <div className="h-full w-full">
            <DataTable />
          </div>
        </main>
      )}
    </div>
  );
}
