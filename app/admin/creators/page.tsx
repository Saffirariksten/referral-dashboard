import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default async function CreatorsPage() {
  const creators = await prisma.creator.findMany({
    include: { orders: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Creators</h1>
        <Link href="/admin/creators/new" className={buttonVariants()}>
          Invite creator
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Code</th>
                <th className="pb-2 font-medium">Commission</th>
                <th className="pb-2 font-medium">Discount</th>
                <th className="pb-2 font-medium">Orders</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {creators.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{c.displayName}</td>
                  <td className="py-3 text-gray-500">{c.user.email}</td>
                  <td className="py-3">
                    <code className="bg-gray-100 px-1 rounded">{c.referralCode}</code>
                  </td>
                  <td className="py-3">{(c.commissionRate * 100).toFixed(0)}%</td>
                  <td className="py-3">{(c.discountRate * 100).toFixed(0)}%</td>
                  <td className="py-3">{c.orders.length}</td>
                  <td className="py-3">
                    <Badge variant={c.active ? "default" : "secondary"}>
                      {c.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Link href={`/admin/creators/${c.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {creators.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-gray-400">
                    No creators yet.
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
