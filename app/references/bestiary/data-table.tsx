"use client";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "convex/react";
import { columns } from "./columns";
import { LoaderPinwheelIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function DataTable() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const { user } = useUser();
  const filters: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== "search" && key !== "monsterId") {
      filters[key] = value;
    }
  });

  const monsters = useQuery(api.monsters.get, {
    search: search ?? undefined,
    filters,
    userId: user?.id,
  });

  const table = useReactTable({
    data: monsters ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRowClick = (monsterId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("monsterId", monsterId);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return monsters !== undefined ? (
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
              {table.getRowModel().rows.length ? (
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
