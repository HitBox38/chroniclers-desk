import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { ConvexClientProvider } from "./providers/ConvexClientProvider";
import { Toaster } from "sonner";

const clerkAppearance = {
  variables: {
    colorPrimary: "var(--primary)",
    colorBackground: "var(--background)",
    colorText: "var(--foreground)",
    colorInputBackground: "var(--input)",
    colorInputText: "var(--foreground)",
    colorTextOnPrimaryBackground: "var(--primary-foreground)",
    colorDanger: "var(--destructive)",
  },
  elements: {
    card: "bg-card text-card-foreground shadow rounded-lg",
    button: "bg-primary text-primary-foreground hover:opacity-90",
    input:
      "bg-input text-foreground placeholder:text-muted-foreground border border-border focus:border-ring focus:ring-ring",
  },
} as const;

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Chronicler's Desk",
  description: "A comprehensive toolset for Dungeon Masters.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: shadcn,
        cssLayerName: "clerk",
        variables: clerkAppearance.variables,
        elements: clerkAppearance.elements,
      }}>
      <html lang="en" className="dark">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider>
            <QueryProvider>
              <ConvexClientProvider>
                <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset>
                    <div className="flex flex-1 flex-col gap-4">{children}</div>
                  </SidebarInset>
                </SidebarProvider>
                <Toaster richColors />
              </ConvexClientProvider>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
