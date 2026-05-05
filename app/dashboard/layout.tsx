import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <span className="font-bold text-lg">Creator Hub</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <a href="/dashboard" className="block px-3 py-2 rounded hover:bg-gray-700 text-sm">
            My dashboard
          </a>
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">{children}</main>
    </div>
  );
}
