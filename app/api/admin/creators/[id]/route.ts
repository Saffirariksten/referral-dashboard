import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { displayName, referralCode, commissionRate, discountRate, active } = body;

  const codeExists = await prisma.creator.findFirst({
    where: { referralCode, NOT: { id } },
  });
  if (codeExists) {
    return NextResponse.json({ error: "This referral code is already in use." }, { status: 400 });
  }

  const creator = await prisma.creator.update({
    where: { id },
    data: { displayName, referralCode, commissionRate, discountRate, active },
  });

  return NextResponse.json(creator);
}
