"use client"

import type React from "react"
import { createContext, use, useCallback, useEffect, useState } from "react"

import type { Theme, ThemeContextType } from "./types"

import canUseDOM from "@/utilities/canUseDOM"
import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from "./shared"
import { themeIsValid } from "./types"

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(
    canUseDOM ? (document.documentElement.getAttribute("data-theme") as Theme) : undefined,
  )

  const setTheme = useCallback((themeToSet: Theme | null) => {
    if (themeToSet === null) {
      // 'auto' mode - use system preference
      const implicitPreference = getImplicitPreference()
      const resolvedTheme = implicitPreference || defaultTheme
      document.documentElement.setAttribute("data-theme", resolvedTheme)
      setThemeState(resolvedTheme)
    } else {
      setThemeState(themeToSet)
      document.documentElement.setAttribute("data-theme", themeToSet)
    }
  }, [])

  useEffect(() => {
    let themeToSet: Theme = defaultTheme
    const preference = window.localStorage.getItem(themeLocalStorageKey)

    if (themeIsValid(preference)) {
      // User explicitly chose light or dark
      themeToSet = preference
    } else if (preference === "auto") {
      // User explicitly chose system preference
      const implicitPreference = getImplicitPreference()
      if (implicitPreference) {
        themeToSet = implicitPreference
      }
    }
    // If no preference, use defaultTheme (light)

    document.documentElement.setAttribute("data-theme", themeToSet)
    setThemeState(themeToSet)
  }, [])

  return <ThemeContext value={{ setTheme, theme }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
