import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { creatorId, orderNumber, grossAmount, customerEmail, notes, orderedAt } = body;

  if (!creatorId || !grossAmount) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
  if (!creator) {
    return NextResponse.json({ error: "Creator not found." }, { status: 404 });
  }

  const gross = parseFloat(grossAmount);
  const discountAmount = gross * creator.discountRate;
  const netAmount = gross - discountAmount;
  const commission = netAmount * creator.commissionRate;

  const order = await prisma.order.create({
    data: {
      creatorId,
      orderNumber,
      grossAmount: gross,
      discountAmount,
      netAmount,
      commission,
      customerEmail,
      notes,
      source: "MANUAL",
      orderedAt: orderedAt ? new Date(orderedAt) : new Date(),
    },
  });

  return NextResponse.json(order);
}
