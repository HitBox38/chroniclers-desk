import { Suspense } from "react";
import SpellsClient from "./spellsClient";

export default function SpellsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SpellsClient />
    </Suspense>
  );
}
