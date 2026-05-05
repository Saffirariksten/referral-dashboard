import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendInvitationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, referralCode, commissionRate, discountRate } = body;

  if (!name || !email || !referralCode) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 400 });
  }

  const codeExists = await prisma.creator.findUnique({ where: { referralCode } });
  if (codeExists) {
    return NextResponse.json({ error: "This referral code is already in use." }, { status: 400 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.invitation.create({
    data: { email, token, expiresAt },
  });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: "CREATOR",
      creator: {
        create: {
          displayName: name,
          referralCode,
          commissionRate: commissionRate ?? 0.1,
          discountRate: discountRate ?? 0.1,
        },
      },
    },
  });

  await sendInvitationEmail({ to: email, name, token });

  return NextResponse.json({ id: user.id });
}
