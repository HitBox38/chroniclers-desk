"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Home,
  Search,
  Settings,
  LogOut,
  Sun,
  Moon,
  History,
  Sword,
  Shield,
  Scroll,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useThemeStore } from "@/lib/stores/useThemeStore";
import { useHistoryStore } from "@/lib/stores/useHistoryStore";
import { SignOutButton, useUser } from "@clerk/nextjs";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "References",
    url: "/references",
    icon: Scroll,
  },
  {
    title: "Bestiary",
    url: "/references/bestiary",
    icon: Shield,
  },
  {
    title: "Characters",
    url: "/characters",
    icon: Users,
  },
  {
    title: "Equipment",
    url: "/equipment",
    icon: Sword,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const { history, addToHistory } = useHistoryStore();
  const { isSignedIn } = useUser();

  // Effect to track page visits
  useEffect(() => {
    // Get page title from current route
    const getPageTitle = (path: string) => {
      const item = items.find((item) => item.url === path);
      if (item) return item.title;

      // Handle dynamic routes
      if (path.startsWith("/references/bestiary/")) {
        return "Monster Details";
      }
      if (path.startsWith("/references/")) {
        return "References";
      }

      return path === "/" ? "Home" : path.split("/").pop() || "Unknown";
    };

    const title = getPageTitle(pathname);

    // Add current page to history
    addToHistory({
      path: pathname,
      title: title,
    });
  }, [pathname, addToHistory]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Scroll className="h-6 w-6" />
          <span className="font-bold text-lg">Chronicler&apos;s Desk</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {history.length > 0 && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Recent History</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {history.map((item, index) => (
                    <SidebarMenuItem key={`${item.path}-${index}`}>
                      <SidebarMenuButton asChild>
                        <Link href={item.path}>
                          <History className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={toggleTheme}>
                  {theme === "dark" ? <Sun /> : <Moon />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isSignedIn && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <SignOutButton>
                      <div className="flex items-center gap-2">
                        <LogOut />
                        <span>Logout</span>
                      </div>
                    </SignOutButton>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
