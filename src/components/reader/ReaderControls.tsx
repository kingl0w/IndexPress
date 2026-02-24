"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const FONT_SIZES = ["small", "medium", "large", "xl"] as const;
const THEMES = ["light", "sepia", "dark"] as const;
const FONT_FAMILIES = ["serif", "sans"] as const;

type FontSize = (typeof FONT_SIZES)[number];
type Theme = (typeof THEMES)[number];
type FontFamily = (typeof FONT_FAMILIES)[number];

const FONT_SIZE_LABELS: Record<FontSize, string> = {
  small: "A",
  medium: "A",
  large: "A",
  xl: "A",
};

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  small: "text-xs",
  medium: "text-sm",
  large: "text-base",
  xl: "text-lg",
};

const THEME_COLORS: Record<Theme, { bg: string; label: string }> = {
  light: { bg: "#ffffff", label: "Light" },
  sepia: { bg: "#f4ecd8", label: "Sepia" },
  dark: { bg: "#1a1a2e", label: "Dark" },
};

interface ReaderControlsProps {
  fontSize: FontSize;
  theme: Theme;
  fontFamily: FontFamily;
}

export default function ReaderControls({
  fontSize,
  theme,
  fontFamily,
}: ReaderControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  if (collapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Open reading controls"
          className="flex h-10 w-10 items-center justify-center rounded-full shadow-lg"
          style={{
            backgroundColor: "var(--reader-controls-bg)",
            border: "1px solid var(--reader-controls-border)",
            color: "var(--reader-text)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] sm:bottom-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:rounded-xl"
      style={{
        backgroundColor: "var(--reader-controls-bg)",
        borderTop: "1px solid var(--reader-controls-border)",
      }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4">
        {/*font size*/}
        <fieldset className="flex items-center gap-1" role="radiogroup" aria-label="Font size">
          <legend className="sr-only">Font size</legend>
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              role="radio"
              aria-checked={fontSize === size}
              aria-label={`Font size ${size}`}
              onClick={() => updateParam("font", size)}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${FONT_SIZE_CLASSES[size]}`}
              style={{
                backgroundColor: fontSize === size ? "var(--reader-btn-active)" : "var(--reader-btn-bg)",
                color: fontSize === size ? "var(--reader-btn-active-text)" : "var(--reader-text)",
              }}
            >
              {FONT_SIZE_LABELS[size]}
            </button>
          ))}
        </fieldset>

        {/*divider*/}
        <div className="h-6 w-px" style={{ backgroundColor: "var(--reader-border)" }} />

        {/*theme*/}
        <fieldset className="flex items-center gap-1" role="radiogroup" aria-label="Color theme">
          <legend className="sr-only">Color theme</legend>
          {THEMES.map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={theme === t}
              aria-label={`${THEME_COLORS[t].label} theme`}
              onClick={() => updateParam("theme", t)}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
              style={{
                backgroundColor: THEME_COLORS[t].bg,
                border: theme === t ? "2px solid var(--reader-accent)" : "1px solid var(--reader-border)",
              }}
            >
              {theme === t && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t === "dark" ? "#d4d4d8" : "#1c1917"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </fieldset>

        {/*divider*/}
        <div className="h-6 w-px" style={{ backgroundColor: "var(--reader-border)" }} />

        {/*font family*/}
        <fieldset className="flex items-center gap-1" role="radiogroup" aria-label="Font family">
          <legend className="sr-only">Font family</legend>
          {FONT_FAMILIES.map((fam) => (
            <button
              key={fam}
              role="radio"
              aria-checked={fontFamily === fam}
              aria-label={fam === "serif" ? "Serif font" : "Sans-serif font"}
              onClick={() => updateParam("family", fam)}
              className="flex h-8 items-center justify-center rounded-md px-2 text-sm transition-colors"
              style={{
                backgroundColor: fontFamily === fam ? "var(--reader-btn-active)" : "var(--reader-btn-bg)",
                color: fontFamily === fam ? "var(--reader-btn-active-text)" : "var(--reader-text)",
                fontFamily: fam === "serif" ? "Georgia, serif" : "system-ui, sans-serif",
              }}
            >
              {fam === "serif" ? "Aa" : "Aa"}
            </button>
          ))}
        </fieldset>

        {/*collapse button*/}
        <button
          onClick={() => setCollapsed(true)}
          aria-label="Minimize reading controls"
          className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors"
          style={{ color: "var(--reader-text-muted)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export type { FontSize, Theme, FontFamily };
export { FONT_SIZES, THEMES, FONT_FAMILIES };
