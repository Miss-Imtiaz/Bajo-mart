"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email: string): Promise<{ success: true }> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  return { success: true };
}

export interface ResetPasswordResult {
  success: boolean;
  error?: string;
}

export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResult> {
  if (newPassword.length < 10) {
    return { success: false, error: "Password must be at least 10 characters." };
  }

  const tokenHash = hashToken(token);
  const resetToken = await prisma.passwordResetToken.findFirst({ where: { tokenHash } });

  if (!resetToken) {
    return { success: false, error: "This reset link is invalid." };
  }
  if (resetToken.usedAt) {
    return { success: false, error: "This reset link has already been used." };
  }
  if (resetToken.expiresAt < new Date()) {
    return { success: false, error: "This reset link has expired. Please request a new one." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ]);

  return { success: true };
}
