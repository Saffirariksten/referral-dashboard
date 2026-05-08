import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreatorDashboardClient } from "@/components/creator-dashboard-client";

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

  return (
    <CreatorDashboardClient
      displayName={creator.displayName}
      referralCode={creator.referralCode}
      commissionRate={creator.commissionRate}
      discountRate={creator.discountRate}
      orders={creator.orders}
    />
  );
}
