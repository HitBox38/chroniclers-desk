"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SearchInput } from "./components/SearchInput";
import { useMemo, useState, type KeyboardEvent } from "react";
import { FilterBadge } from "./components/FilterBadge";

interface Props {
  properties?: string[];
}

export const SearchBox = ({ properties }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [inputValue, setInputValue] = useState(() => searchParams.get("search") || "");

  const filters = useMemo(() => {
    const newFilters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== "search" && key !== "monsterId") {
        newFilters[key] = value;
      }
    });
    return newFilters;
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    if (!value.includes(":")) {
      updateUrl(value, filters);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const parts = inputValue.split(":");
      if (parts.length === 2 && properties?.includes(parts[0])) {
        const newFilters = { ...filters, [parts[0]]: parts[1].trim() };
        setInputValue("");
        updateUrl(null, newFilters);
      }
    }
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    updateUrl(searchParams.get("search"), newFilters);
  };

  const updateUrl = (search: string | null, newFilters: Record<string, string>) => {
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    for (const [key, value] of Object.entries(newFilters)) {
      params.set(key, value);
    }
    const monsterId = searchParams.get("monsterId");
    if (monsterId) {
      params.set("monsterId", monsterId);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-2">
      <SearchInput
        value={inputValue}
        onChange={handleSearchChange}
        properties={properties ?? []}
        onKeyDown={handleKeyDown}
      />
      <div className="flex gap-2 overflow-x-auto flex-nowrap pb-2">
        {Object.entries(filters).map(([key, value]) => (
          <FilterBadge key={key} filterKey={key} value={value} onRemove={removeFilter} />
        ))}
      </div>
    </div>
  );
};
