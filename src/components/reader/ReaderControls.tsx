"use client";

import { useCallback } from "react";
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
  light: { bg: "#F5F0E8", label: "Light" },
  sepia: { bg: "#f4ecd8", label: "Sepia" },
  dark: { bg: "#1C1714", label: "Dark" },
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

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <div
      className="border-b"
      style={{
        backgroundColor: "var(--reader-controls-bg)",
        borderColor: "var(--reader-controls-border)",
      }}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 px-4 py-2 sm:gap-4">
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
        <div className="h-5 w-px" style={{ backgroundColor: "var(--reader-border)" }} />

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
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t === "dark" ? "#D4CCC0" : "#1C1714"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </fieldset>

        {/*divider*/}
        <div className="h-5 w-px" style={{ backgroundColor: "var(--reader-border)" }} />

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
              className="flex h-8 items-center justify-center rounded-md px-2.5 text-sm transition-colors"
              style={{
                backgroundColor: fontFamily === fam ? "var(--reader-btn-active)" : "var(--reader-btn-bg)",
                color: fontFamily === fam ? "var(--reader-btn-active-text)" : "var(--reader-text)",
                fontFamily: fam === "serif" ? "var(--font-eb-garamond), Georgia, serif" : "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              Aa
            </button>
          ))}
        </fieldset>
      </div>
    </div>
  );
}

export type { FontSize, Theme, FontFamily };
export { FONT_SIZES, THEMES, FONT_FAMILIES };
