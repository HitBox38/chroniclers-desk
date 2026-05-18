"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { LoaderPinwheelIcon } from "lucide-react";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mergeSpellRows, shouldShowSpellTableLoading } from "@/lib/spells/open5e";
import { columns } from "./columns";
import type { SpellBase } from "./type";

interface Open5eSpellListResponse {
  results: SpellBase[];
}

const EMPTY_SPELL_ROWS: SpellBase[] = [];

async function fetchOpen5eSpells(search: string | undefined, filters: Record<string, string>) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  for (const [key, value] of Object.entries(filters)) {
    params.set(key, value);
  }

  const response = await fetch(`/api/open5e/spells?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to load Open5e spells.");
  }

  const data = (await response.json()) as Open5eSpellListResponse;
  return data.results;
}

export default function DataTable() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useUser();
  const search = searchParams.get("search");
  const filters = useMemo(() => {
    const nextFilters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== "search" && key !== "spellId") {
        nextFilters[key] = value;
      }
    });
    return nextFilters;
  }, [searchParams]);

  const open5eSpells = useReactQuery({
    queryKey: ["open5e-spells", search, filters],
    queryFn: () => fetchOpen5eSpells(search ?? undefined, filters),
  });
  const spells = useMemo(() => {
    if (!open5eSpells.data) {
      return EMPTY_SPELL_ROWS;
    }

    return mergeSpellRows(open5eSpells.data, EMPTY_SPELL_ROWS);
  }, [open5eSpells.data]);
  const isLoading = shouldShowSpellTableLoading({
    isOpen5ePending: open5eSpells.isPending,
    isSignedIn,
    customRowsLoaded: true,
  });

  // TanStack Table exposes function properties that React Compiler cannot memoize safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: spells,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRowClick = (spellId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("spellId", spellId);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return !isLoading ? (
    <div className="h-full flex flex-col">
      <ScrollArea className="h-full w-full rounded-md border">
        <div className="h-full w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {open5eSpells.isError ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Unable to load Open5e spells.
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    data-state={row.getIsSelected() ? "selected" : ""}
                    onClick={() => handleRowClick(row.original.id)}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  ) : (
    <div className="h-full flex items-center justify-center">
      <LoaderPinwheelIcon className="animate-spin" />
    </div>
  );
}
