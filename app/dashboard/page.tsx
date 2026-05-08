import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CreatorDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const creator = await prisma.creator.findUnique({
    where: { userId: session.user.id },
    include: { orders: { orderBy: { orderedAt: "desc" } } },
  });

  if (!creator) {
    return (
      <div className="text-gray-500">
        Your creator profile is not set up yet. Please contact the admin.
      </div>
    );
  }

  const netRevenue = creator.orders.reduce((s, o) => s + o.netAmount, 0);
  const totalCommission = creator.orders.reduce((s, o) => s + o.commission, 0);

  return (
    <div className="space-y-5 max-w-2xl mx-auto md:mx-0">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Hi, {creator.displayName}!</h1>
        <p className="text-gray-500 mt-1 text-sm">Here&apos;s your referral overview.</p>
      </div>

      {/* Referral code card */}
      <div className="bg-white border rounded-xl p-5">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your referral code</p>
        <code className="text-3xl font-bold tracking-wider">{creator.referralCode}</code>
        <div className="flex gap-6 mt-4 text-sm">
          <div>
            <p className="text-gray-500">Customer discount</p>
            <p className="font-semibold text-base">{(creator.discountRate * 100).toFixed(0)}% off</p>
          </div>
          <div>
            <p className="text-gray-500">Your commission</p>
            <p className="font-semibold text-base">{(creator.commissionRate * 100).toFixed(0)}% of net</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-gray-500">Orders</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <span className="text-2xl font-bold">{creator.orders.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-gray-500">Net revenue</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <span className="text-2xl font-bold">€{netRevenue.toFixed(0)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-gray-500">Commission</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <span className="text-2xl font-bold">€{totalCommission.toFixed(0)}</span>
          </CardContent>
        </Card>
      </div>

      {/* Orders — cards on mobile, table on desktop */}
      <Card>
        <CardHeader>
          <CardTitle>Orders via your code</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: cards */}
          <div className="md:hidden space-y-3">
            {creator.orders.length === 0 && (
              <p className="text-center text-gray-400 py-6 text-sm">
                No orders yet. Share your code to get started!
              </p>
            )}
            {creator.orders.map((o) => (
              <div key={o.id} className="border rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{o.orderNumber ?? "Order"}</p>
                    <p className="text-gray-400 text-xs">{new Date(o.orderedAt).toLocaleDateString("en-GB")}</p>
                  </div>
                  <Badge variant="secondary">{o.source}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>
                    <p>Gross</p>
                    <p className="text-gray-800 font-medium">€{o.grossAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p>Discount</p>
                    <p className="text-gray-800 font-medium">-€{o.discountAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p>Net</p>
                    <p className="text-gray-800 font-medium">€{o.netAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p>Your commission</p>
                    <p className="font-bold text-gray-900">€{o.commission.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Order #</th>
                <th className="pb-2 font-medium">Gross</th>
                <th className="pb-2 font-medium">Discount</th>
                <th className="pb-2 font-medium">Net</th>
                <th className="pb-2 font-medium">Commission</th>
                <th className="pb-2 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {creator.orders.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-2">{new Date(o.orderedAt).toLocaleDateString("en-GB")}</td>
                  <td className="py-2">{o.orderNumber ?? "—"}</td>
                  <td className="py-2">€{o.grossAmount.toFixed(2)}</td>
                  <td className="py-2">-€{o.discountAmount.toFixed(2)}</td>
                  <td className="py-2">€{o.netAmount.toFixed(2)}</td>
                  <td className="py-2 font-medium">€{o.commission.toFixed(2)}</td>
                  <td className="py-2">
                    <Badge variant="secondary">{o.source}</Badge>
                  </td>
                </tr>
              ))}
              {creator.orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-400">
                    No orders yet. Share your code to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
