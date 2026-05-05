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

  const normalizedCode = referralCode?.toUpperCase();

  const codeExists = await prisma.creator.findFirst({
    where: { referralCode: normalizedCode, NOT: { id } },
  });
  if (codeExists) {
    return NextResponse.json({ error: "This referral code is already in use." }, { status: 400 });
  }

  const creator = await prisma.creator.update({
    where: { id },
    data: { displayName, referralCode: normalizedCode, commissionRate, discountRate, active },
  });

  return NextResponse.json(creator);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const creator = await prisma.creator.findUnique({ where: { id }, include: { user: true } });
  if (!creator) {
    return NextResponse.json({ error: "Creator not found." }, { status: 404 });
  }

  await prisma.order.deleteMany({ where: { creatorId: id } });
  await prisma.creator.delete({ where: { id } });
  await prisma.user.delete({ where: { id: creator.userId } });

  return NextResponse.json({ ok: true });
}
