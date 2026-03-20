import type { Metadata } from "next";
import { Space_Grotesk, EB_Garamond } from "next/font/google";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import NavLinks from "@/components/NavLinks";
import SearchHotkey from "@/components/SearchHotkey";
import { SITE_NAME, SITE_URL } from "@/lib/utils";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Free Classic Literature Online`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Read thousands of free classic books on IndexPress. Browse by author, subject, or search the full catalog.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${ebGaramond.variable} ${spaceGrotesk.className} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-[#F5F0E8]"
        >
          Skip to content
        </a>

        <header className="relative z-50 border-b border-[#2A2420] bg-ink">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="text-xl font-serif font-bold tracking-tight text-[#F5F0E8] hover:text-[#D4CCC0] transition-colors"
            >
              {SITE_NAME}
            </Link>

            <NavLinks />

            <MobileNav />
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-sm text-secondary">
                <p>
                  Books sourced from{" "}
                  <a
                    href="https://www.gutenberg.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-ink transition-colors"
                  >
                    Project Gutenberg
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                  . Not affiliated with or endorsed by Project Gutenberg.
                </p>
              </div>
              <nav aria-label="Footer navigation">
                <ul className="flex gap-6 text-sm text-secondary">
                  <li>
                    <Link href="/books" className="hover:text-ink transition-colors">
                      Browse
                    </Link>
                  </li>
                  <li>
                    <Link href="/authors" className="hover:text-ink transition-colors">
                      Authors
                    </Link>
                  </li>
                  <li>
                    <Link href="/subjects" className="hover:text-ink transition-colors">
                      Subjects
                    </Link>
                  </li>
                  <li>
                    <Link href="/random" className="hover:text-ink transition-colors">
                      Random Book
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
