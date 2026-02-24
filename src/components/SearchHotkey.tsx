"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function SearchHotkey() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();

        if (pathname === "/search") {
          window.dispatchEvent(new CustomEvent("focus-search-bar"));
          const searchInput = document.querySelector<HTMLInputElement>(
            'input[type="search"]'
          );
          searchInput?.focus();
        } else {
          router.push("/search");
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router, pathname]);

  return null;
}
