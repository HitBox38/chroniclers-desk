"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MonsterBase } from "./type";
import { Badge } from "@/components/ui/badge";

interface MonsterWithUserFlag extends MonsterBase {
  isUserCreated?: boolean;
}

export const columns: ColumnDef<MonsterWithUserFlag>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const { name, isUserCreated } = row.original;
      return (
        <div className="flex items-center gap-2">
          <span>{name}</span>
          {isUserCreated && (
            <Badge variant="secondary" className="text-xs">
              Custom
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const { type, subtype } = row.original;
      return <>{subtype ? `${type} (${subtype})` : type}</>;
    },
  },
  {
    accessorKey: "hitPoints",
    header: "Hit Points",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
];
