import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddOrderDialog } from "@/components/add-order-dialog";
import { OrderActions } from "@/components/order-actions";

export default async function OrdersPage() {
  const [orders, creators] = await Promise.all([
    prisma.order.findMany({
      include: { creator: true },
      orderBy: { orderedAt: "desc" },
    }),
    prisma.creator.findMany({ where: { active: true }, orderBy: { displayName: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <AddOrderDialog creators={creators} />
      </div>

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Order #</th>
                <th className="pb-2 font-medium">Creator</th>
                <th className="pb-2 font-medium">Gross</th>
                <th className="pb-2 font-medium">Discount</th>
                <th className="pb-2 font-medium">Net</th>
                <th className="pb-2 font-medium">Commission</th>
                <th className="pb-2 font-medium">Source</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-2">{new Date(o.orderedAt).toLocaleDateString("en-GB")}</td>
                  <td className="py-2">{o.orderNumber ?? "—"}</td>
                  <td className="py-2">{o.creator.displayName}</td>
                  <td className="py-2">€{o.grossAmount.toFixed(2)}</td>
                  <td className="py-2">-€{o.discountAmount.toFixed(2)}</td>
                  <td className="py-2">€{o.netAmount.toFixed(2)}</td>
                  <td className="py-2">€{o.commission.toFixed(2)}</td>
                  <td className="py-2"><Badge variant="secondary">{o.source}</Badge></td>
                  <td className="py-2">
                    <OrderActions order={o} creator={o.creator} />
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-gray-400">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
