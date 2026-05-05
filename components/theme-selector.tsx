"use client";

import { useEffect, useState } from "react";
import { themes, type Theme } from "@/lib/theme";

export function ThemeSelector() {
  const [current, setCurrent] = useState<Theme>("original");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) setCurrent(stored);
  }, []);

  function select(value: Theme) {
    setCurrent(value);
    localStorage.setItem("theme", value);
    window.dispatchEvent(new Event("theme-change"));
  }

  return (
    <div className="flex gap-3">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => select(t.value)}
          className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
            current === t.value ? "border-black" : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div
            className="w-16 h-10 rounded"
            style={{ backgroundColor: t.sidebar, border: "1px solid rgba(0,0,0,0.1)" }}
          />
          <span className="text-xs font-medium">{t.label}</span>
          {current === t.value && (
            <span className="text-xs text-green-600 font-semibold">Active</span>
          )}
        </button>
      ))}
    </div>
  );
}
