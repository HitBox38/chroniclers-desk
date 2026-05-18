"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SpellBase } from "./type";

export const columns: ColumnDef<SpellBase>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => (row.original.level === 0 ? "Cantrip" : row.original.level),
  },
  {
    accessorKey: "school",
    header: "School",
  },
  {
    accessorKey: "castingTime",
    header: "Casting Time",
  },
  {
    accessorKey: "range",
    header: "Range",
  },
  {
    accessorKey: "classes",
    header: "Classes",
    cell: ({ row }) => row.original.classes.join(", "),
  },
];
