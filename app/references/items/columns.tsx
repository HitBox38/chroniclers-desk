"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ItemBase } from "./type";

export const columns: ColumnDef<ItemBase>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "rarity",
    header: "Rarity",
  },
  {
    accessorKey: "requiresAttunement",
    header: "Attunement",
    cell: ({ row }) => (row.original.requiresAttunement ? "Yes" : "No"),
  },
  {
    accessorKey: "source",
    header: "Source",
  },
];
