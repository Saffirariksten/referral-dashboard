import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ThemedSidebar } from "@/components/themed-sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex">
      <ThemedSidebar
        title="Creator Hub"
        navItems={[{ href: "/dashboard", label: "My dashboard" }]}
      />
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">{children}</main>
    </div>
  );
}
