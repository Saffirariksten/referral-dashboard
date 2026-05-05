import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function verifyShopifyWebhook(body: string, hmacHeader: string): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return false;
  const digest = crypto.createHmac("sha256", secret).update(body).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256") ?? "";

  if (process.env.SHOPIFY_WEBHOOK_SECRET && !verifyShopifyWebhook(rawBody, hmacHeader)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let order: Record<string, unknown>;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const shopifyOrderId = String(order.id);
  const existing = await prisma.order.findUnique({ where: { shopifyOrderId } });
  if (existing) {
    return NextResponse.json({ skipped: true });
  }

  // Find which creator's code was used
  const discountCodes = (order.discount_codes as { code: string }[]) ?? [];
  if (discountCodes.length === 0) {
    return NextResponse.json({ skipped: true, reason: "no discount code" });
  }

  const usedCode = discountCodes[0].code.toUpperCase();
  const creator = await prisma.creator.findUnique({ where: { referralCode: usedCode } });
  if (!creator) {
    return NextResponse.json({ skipped: true, reason: "code not matched" });
  }

  const grossAmount = parseFloat(String(order.total_price ?? 0));
  const discountAmount = parseFloat(String(order.total_discounts ?? 0));
  const netAmount = grossAmount - discountAmount;
  const commission = netAmount * creator.commissionRate;

  await prisma.order.create({
    data: {
      creatorId: creator.id,
      orderNumber: String(order.order_number ?? order.name ?? shopifyOrderId),
      shopifyOrderId,
      grossAmount,
      discountAmount,
      netAmount,
      commission,
      customerEmail: (order.email as string) ?? null,
      source: "SHOPIFY",
      orderedAt: order.created_at ? new Date(String(order.created_at)) : new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
