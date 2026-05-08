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
  const { orderNumber, grossAmount, customerEmail, notes, orderedAt } = body;

  const order = await prisma.order.findUnique({ where: { id }, include: { creator: true } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const gross = parseFloat(grossAmount);
  const discountAmount = gross * order.creator.discountRate;
  const netAmount = gross - discountAmount;
  const commission = netAmount * order.creator.commissionRate;

  const updated = await prisma.order.update({
    where: { id },
    data: {
      orderNumber: orderNumber || null,
      grossAmount: gross,
      discountAmount,
      netAmount,
      commission,
      customerEmail: customerEmail || null,
      notes: notes || null,
      orderedAt: orderedAt ? new Date(orderedAt) : order.orderedAt,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
