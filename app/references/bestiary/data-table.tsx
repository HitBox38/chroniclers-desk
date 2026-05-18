"use client";

import { useUser } from "@clerk/nextjs";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery as useConvexQuery } from "convex/react";
import { columns } from "./columns";
import { LoaderPinwheelIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { mergeBestiaryRows, shouldShowBestiaryTableLoading } from "@/lib/bestiary/open5e";
import { useMemo } from "react";
import type { MonsterBase } from "./type";

interface Open5eListResponse {
  results: MonsterBase[];
}

const EMPTY_BESTIARY_ROWS: MonsterBase[] = [];

async function fetchOpen5eMonsters(search: string | undefined, filters: Record<string, string>) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  for (const [key, value] of Object.entries(filters)) {
    params.set(key, value);
  }

  const response = await fetch(`/api/open5e/monsters?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to load Open5e monsters.");
  }

  const data = (await response.json()) as Open5eListResponse;
  return data.results;
}

export default function DataTable() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useUser();
  const search = searchParams.get("search");
  const filters = useMemo(() => {
    const nextFilters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== "search" && key !== "monsterId") {
        nextFilters[key] = value;
      }
    });
    return nextFilters;
  }, [searchParams]);

  const open5eMonsters = useReactQuery({
    queryKey: ["open5e-monsters", search, filters],
    queryFn: () => fetchOpen5eMonsters(search ?? undefined, filters),
  });
  const customMonsters = useConvexQuery(
    api.monsters.get,
    isLoaded && isSignedIn
      ? {
          search: search ?? undefined,
          filters,
        }
      : "skip"
  );
  const monsters = useMemo(() => {
    if (!open5eMonsters.data) {
      return EMPTY_BESTIARY_ROWS;
    }

    return mergeBestiaryRows(open5eMonsters.data, customMonsters ?? EMPTY_BESTIARY_ROWS);
  }, [customMonsters, open5eMonsters.data]);
  const isLoading = shouldShowBestiaryTableLoading({
    isOpen5ePending: open5eMonsters.isPending,
    isSignedIn,
    customRowsLoaded: customMonsters !== undefined,
  });

  // TanStack Table exposes function properties that React Compiler cannot memoize safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: monsters,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRowClick = (monsterId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("monsterId", monsterId);
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
              {open5eMonsters.isError ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Unable to load Open5e creatures.
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
