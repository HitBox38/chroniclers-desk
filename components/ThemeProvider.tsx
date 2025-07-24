"use client"

import { useEffect } from "react"
import { useThemeStore } from "@/lib/stores/useThemeStore"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore()

  useEffect(() => {
    // Apply theme immediately on mount to prevent flashing
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  return <>{children}</>
}