"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({
  textColor = "#ffffff",
  hoverBg = "rgba(255,255,255,0.1)",
}: {
  textColor?: string;
  hoverBg?: string;
}) {
  return (
    <button
      className="w-full text-left px-3 py-2 rounded text-sm transition-colors"
      style={{ color: textColor }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sign out
    </button>
  );
}
