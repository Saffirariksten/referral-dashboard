import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendInvitationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const creator = await prisma.creator.findUnique({ where: { id }, include: { user: true } });
  if (!creator) {
    return NextResponse.json({ error: "Creator not found." }, { status: 404 });
  }

  if (creator.user.password) {
    return NextResponse.json(
      { error: "This creator already has an active account and does not need a new invitation." },
      { status: 400 }
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.invitation.updateMany({
    where: { email: creator.user.email, status: "PENDING" },
    data: { status: "EXPIRED" },
  });

  await prisma.invitation.create({
    data: { email: creator.user.email, token, expiresAt },
  });

  await sendInvitationEmail({ to: creator.user.email, name: creator.displayName, token });

  return NextResponse.json({ ok: true });
}
