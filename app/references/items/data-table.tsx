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
import { mergeItemRows, shouldShowItemTableLoading } from "@/lib/items/open5e";
import { columns } from "./columns";
import type { ItemBase } from "./type";

interface Open5eItemListResponse {
  results: ItemBase[];
}

const EMPTY_ITEM_ROWS: ItemBase[] = [];

async function fetchOpen5eItems(search: string | undefined, filters: Record<string, string>) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  for (const [key, value] of Object.entries(filters)) {
    params.set(key, value);
  }

  const response = await fetch(`/api/open5e/items?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to load Open5e items.");
  }

  const data = (await response.json()) as Open5eItemListResponse;
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
      if (key !== "search" && key !== "itemId") {
        nextFilters[key] = value;
      }
    });
    return nextFilters;
  }, [searchParams]);

  const open5eItems = useReactQuery({
    queryKey: ["open5e-items", search, filters],
    queryFn: () => fetchOpen5eItems(search ?? undefined, filters),
  });
  const items = useMemo(() => {
    if (!open5eItems.data) {
      return EMPTY_ITEM_ROWS;
    }

    return mergeItemRows(open5eItems.data, EMPTY_ITEM_ROWS);
  }, [open5eItems.data]);
  const isLoading = shouldShowItemTableLoading({
    isOpen5ePending: open5eItems.isPending,
    isSignedIn,
    customRowsLoaded: true,
  });

  // TanStack Table exposes function properties that React Compiler cannot memoize safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRowClick = (itemId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("itemId", itemId);
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
              {open5eItems.isError ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Unable to load Open5e items.
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
