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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hi, {creator.displayName}!</h1>
        <p className="text-gray-500 mt-1">Here's your referral overview.</p>
      </div>

      <div className="bg-white border rounded-lg p-4 flex items-center gap-4">
        <div>
          <p className="text-sm text-gray-500">Your referral code</p>
          <code className="text-2xl font-bold">{creator.referralCode}</code>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm text-gray-500">Customer discount</p>
          <span className="text-lg font-semibold">{(creator.discountRate * 100).toFixed(0)}% off</span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Your commission</p>
          <span className="text-lg font-semibold">{(creator.commissionRate * 100).toFixed(0)}% of net</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total orders</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{creator.orders.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Net revenue generated</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">€{netRevenue.toFixed(2)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Your commission</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">€{totalCommission.toFixed(2)}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders via your code</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Order #</th>
                <th className="pb-2 font-medium">Gross</th>
                <th className="pb-2 font-medium">Discount</th>
                <th className="pb-2 font-medium">Net</th>
                <th className="pb-2 font-medium">Your commission</th>
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
