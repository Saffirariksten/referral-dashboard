import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreatorSalesChart } from "@/components/creator-sales-chart";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const creators = await prisma.creator.findMany({
    include: { orders: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  const totalOrders = creators.reduce((sum, c) => sum + c.orders.length, 0);
  const totalRevenue = creators.reduce(
    (sum, c) => sum + c.orders.reduce((s, o) => s + o.netAmount, 0),
    0
  );
  const totalCommission = creators.reduce(
    (sum, c) => sum + c.orders.reduce((s, o) => s + o.commission, 0),
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total orders</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{totalOrders}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total net revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">€{totalRevenue.toFixed(2)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total commission owed</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">€{totalCommission.toFixed(2)}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top creators by net revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatorSalesChart
            data={creators
              .map((c) => ({
                name: c.displayName,
                netRevenue: c.orders.reduce((s, o) => s + o.netAmount, 0),
                commission: c.orders.reduce((s, o) => s + o.commission, 0),
              }))
              .sort((a, b) => b.netRevenue - a.netRevenue)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Creators</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: cards */}
          <div className="md:hidden space-y-3">
            {creators.length === 0 && (
              <p className="text-center text-gray-400 py-6 text-sm">No creators yet.</p>
            )}
            {creators.map((c) => {
              const netRev = c.orders.reduce((s, o) => s + o.netAmount, 0);
              const commission = c.orders.reduce((s, o) => s + o.commission, 0);
              return (
                <Link key={c.id} href={`/admin/creators/${c.id}`} className="block border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{c.displayName}</span>
                    <Badge variant={c.active ? "default" : "secondary"}>
                      {c.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{c.referralCode}</code>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 pt-1">
                    <div><p>Orders</p><p className="font-semibold text-gray-800">{c.orders.length}</p></div>
                    <div><p>Net revenue</p><p className="font-semibold text-gray-800">€{netRev.toFixed(0)}</p></div>
                    <div><p>Commission</p><p className="font-semibold text-gray-800">€{commission.toFixed(0)}</p></div>
                  </div>
                </Link>
              );
            })}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Code</th>
                  <th className="pb-2 font-medium">Commission</th>
                  <th className="pb-2 font-medium">Discount</th>
                  <th className="pb-2 font-medium">Orders</th>
                  <th className="pb-2 font-medium">Net revenue</th>
                  <th className="pb-2 font-medium">Commission owed</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {creators.map((c) => {
                  const netRev = c.orders.reduce((s, o) => s + o.netAmount, 0);
                  const commission = c.orders.reduce((s, o) => s + o.commission, 0);
                  return (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-3">
                        <Link href={`/admin/creators/${c.id}`} className="font-medium hover:underline">
                          {c.displayName}
                        </Link>
                      </td>
                      <td className="py-3"><code className="bg-gray-100 px-1 rounded">{c.referralCode}</code></td>
                      <td className="py-3">{(c.commissionRate * 100).toFixed(0)}%</td>
                      <td className="py-3">{(c.discountRate * 100).toFixed(0)}%</td>
                      <td className="py-3">{c.orders.length}</td>
                      <td className="py-3">€{netRev.toFixed(2)}</td>
                      <td className="py-3">€{commission.toFixed(2)}</td>
                      <td className="py-3">
                        <Badge variant={c.active ? "default" : "secondary"}>
                          {c.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {creators.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-400">
                      No creators yet.{" "}
                      <Link href="/admin/creators/new" className="underline">Invite one</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
