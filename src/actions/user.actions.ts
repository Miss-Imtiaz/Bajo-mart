"use server";

import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

// Lets a logged-in user change their OWN name/email and password.
// Nobody can change someone else's password — this action always operates
// on the currently logged-in user's own account only.
export async function updateOwnProfile(formData: {
  name: string;
  email: string;
  currentPassword: string;
  newPassword?: string;
}): Promise<UpdateProfileResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "You must be logged in." };
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, error: "Account not found." };
  }

  const currentPasswordValid = await bcrypt.compare(formData.currentPassword, user.passwordHash);
  if (!currentPasswordValid) {
    return { success: false, error: "Current password is incorrect." };
  }

  const updateData: { name: string; email: string; passwordHash?: string } = {
    name: formData.name.trim(),
    email: formData.email.trim().toLowerCase(),
  };

  if (formData.newPassword) {
    if (formData.newPassword.length < 10) {
      return { success: false, error: "New password must be at least 10 characters." };
    }
    updateData.passwordHash = await bcrypt.hash(formData.newPassword, 10);
  }

  const emailTaken = await prisma.user.findFirst({
    where: { email: updateData.email, NOT: { id: userId } },
  });
  if (emailTaken) {
    return { success: false, error: "That email is already used by another account." };
  }

  await prisma.user.update({ where: { id: userId }, data: updateData });

  return { success: true };
}
