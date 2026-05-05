import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditCreatorForm } from "@/components/edit-creator-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CreatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creator = await prisma.creator.findUnique({
    where: { id },
    include: { orders: { orderBy: { orderedAt: "desc" } }, user: true },
  });

  if (!creator) notFound();

  const netRevenue = creator.orders.reduce((s, o) => s + o.netAmount, 0);
  const totalCommission = creator.orders.reduce((s, o) => s + o.commission, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">{creator.displayName}</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{creator.orders.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Net revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">€{netRevenue.toFixed(2)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Commission owed</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">€{totalCommission.toFixed(2)}</span>
          </CardContent>
        </Card>
      </div>

      <EditCreatorForm creator={creator} />

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
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
                  <td className="py-2">€{o.commission.toFixed(2)}</td>
                  <td className="py-2">
                    <Badge variant="secondary">{o.source}</Badge>
                  </td>
                </tr>
              ))}
              {creator.orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-400">
                    No orders yet.
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
