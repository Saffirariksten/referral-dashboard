"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const t = getTheme(theme);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-56 flex-col flex-shrink-0"
        style={{ backgroundColor: t.sidebar, color: t.sidebarText }}
      >
        <div
          className="px-6 pt-5 pb-3 flex flex-col items-center gap-2"
          style={{ borderBottom: `1px solid ${t.border}` }}
        >
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
              style={{
                color: t.sidebarText,
                backgroundColor: pathname === item.href ? t.hover : "transparent",
                fontWeight: pathname === item.href ? 600 : 400,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4" style={{ borderTop: `1px solid ${t.border}` }}>
          <SignOutButton textColor={t.sidebarText} hoverBg={t.hover} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
        style={{ backgroundColor: t.sidebar, color: t.sidebarText }}
      >
        <Image
          src="/logo.png"
          alt="Ostium Home"
          width={80}
          height={32}
          className="object-contain"
          style={{ filter: theme === "dark" ? "invert(1)" : "none" }}
        />
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded"
          style={{ color: t.sidebarText }}
          aria-label="Menu"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <>
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="md:hidden fixed top-14 left-0 right-0 z-30 shadow-lg"
          style={{ backgroundColor: t.sidebar, color: t.sidebarText }}
        >
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-3 rounded text-sm"
                style={{
                  color: t.sidebarText,
                  backgroundColor: pathname === item.href ? t.hover : "transparent",
                  fontWeight: pathname === item.href ? 600 : 400,
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-3" style={{ borderTop: `1px solid ${t.border}` }}>
            <SignOutButton textColor={t.sidebarText} hoverBg={t.hover} />
          </div>
        </div>
      )}
    </>
  );
}
