import Script from "next/script"
import type React from "react"

import { defaultTheme, themeLocalStorageKey } from "../shared"

export const InitTheme: React.FC = () => {
  return (
    <Script
      dangerouslySetInnerHTML={{
        __html: `
  (function () {
    function getSystemPreference() {
      var mediaQuery = '(prefers-color-scheme: dark)'
      var mql = window.matchMedia(mediaQuery)
      var hasPreference = typeof mql.matches === 'boolean'

      if (hasPreference) {
        return mql.matches ? 'dark' : 'light'
      }

      return '${defaultTheme}'
    }

    var themeToSet = '${defaultTheme}'
    var preference = window.localStorage.getItem('${themeLocalStorageKey}')

    if (preference === 'light' || preference === 'dark') {
      // User explicitly chose light or dark
      themeToSet = preference
    } else if (preference === 'auto') {
      // User explicitly chose system preference
      themeToSet = getSystemPreference()
    }
    // If no preference saved, use defaultTheme (light)

    document.documentElement.setAttribute('data-theme', themeToSet)
  })();
  `,
      }}
      id="theme-script"
      strategy="beforeInteractive"
    />
  )
}
