import { LoaderPinwheelIcon } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";

interface Props {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Items - Chronicler's Desk",
  description: "A searchable magic item reference.",
};

export default async function ItemsLayout({ children }: Props) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <LoaderPinwheelIcon className="animate-spin" />
        </div>
      }>
      {children}
    </Suspense>
  );
}
