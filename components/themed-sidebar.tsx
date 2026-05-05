"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignOutButton } from "@/components/sign-out-button";
import { getTheme, type Theme } from "@/lib/theme";

type NavItem = { href: string; label: string };

export function ThemedSidebar({
  title,
  navItems,
}: {
  title: string;
  navItems: NavItem[];
}) {
  const [theme, setTheme] = useState<Theme>("original");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) setTheme(stored);

    const handler = () => {
      const updated = localStorage.getItem("theme") as Theme | null;
      if (updated) setTheme(updated);
    };
    window.addEventListener("theme-change", handler);
    return () => window.removeEventListener("theme-change", handler);
  }, []);

  const t = getTheme(theme);

  return (
    <aside
      className="w-56 flex flex-col flex-shrink-0"
      style={{ backgroundColor: t.sidebar, color: t.sidebarText }}
    >
      <div className="px-6 pt-5 pb-3 flex flex-col items-center gap-2" style={{ borderBottom: `1px solid ${t.border}` }}>
        <Image
          src="/logo.png"
          alt="Ostium Home"
          width={120}
          height={48}
          className="object-contain"
          style={{ filter: theme === "dark" ? "invert(1)" : "none" }}
        />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded text-sm transition-colors"
            style={{ color: t.sidebarText }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4" style={{ borderTop: `1px solid ${t.border}` }}>
        <SignOutButton textColor={t.sidebarText} hoverBg={t.hover} />
      </div>
    </aside>
  );
}
