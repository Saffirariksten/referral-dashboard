import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ThemedSidebar } from "@/components/themed-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="min-h-screen flex">
      <ThemedSidebar
        title="Referral Admin"
        navItems={[
          { href: "/admin", label: "Overview" },
          { href: "/admin/creators", label: "Creators" },
          { href: "/admin/orders", label: "Orders" },
          { href: "/admin/settings", label: "Settings" },
        ]}
      />
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">{children}</main>
    </div>
  );
}
