import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import SearchHotkey from "@/components/SearchHotkey";
import { SITE_NAME, SITE_URL } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Free Classic Literature Online`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Read thousands of free classic books on IndexPress. Browse by author, subject, or search the full catalog.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
  },
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Browse" },
  { href: "/authors", label: "Authors" },
  { href: "/subjects", label: "Subjects" },
  { href: "/search", label: "Search" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-stone-900 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <header className="relative border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-slate-950">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-stone-900 hover:text-teal-600 dark:text-stone-100 dark:hover:text-teal-400 transition-colors"
            >
              {SITE_NAME}
            </Link>

            <nav aria-label="Main navigation" className="hidden md:block">
              <ul className="flex items-center gap-8">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-stone-600 hover:text-teal-600 dark:text-stone-400 dark:hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <MobileNav />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 opacity-70" aria-hidden="true" />
        </header>

        <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Books sourced from{" "}
                <a
                  href="https://www.gutenberg.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Project Gutenberg
                </a>
                . Not affiliated with or endorsed by Project Gutenberg.
              </p>
              <nav aria-label="Footer navigation">
                <ul className="flex gap-6 text-sm text-stone-500 dark:text-stone-400">
                  <li>
                    <Link href="/books" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                      Browse
                    </Link>
                  </li>
                  <li>
                    <Link href="/authors" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                      Authors
                    </Link>
                  </li>
                  <li>
                    <Link href="/subjects" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                      Subjects
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </footer>

        <SearchHotkey />
      </body>
    </html>
  );
}
