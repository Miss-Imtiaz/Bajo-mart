"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { resetPassword } from "@/actions/password-reset.actions";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const result = await resetPassword(token, newPassword);

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    router.push("/login?reset=success");
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper-100 px-4">
        <div className="w-full max-w-sm rounded-card border border-line-200 bg-paper-0 p-8">
          <p className="text-sm text-danger-600">
            This reset link is missing or invalid. Please request a new one.
          </p>

          <a
            href="/forgot-password"
            className="mt-4 block text-center text-sm text-petrol-600"
          >
            Request a new link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-card border border-line-200 bg-paper-0 p-8"
      >
        <h1 className="mb-6 text-2xl font-bold text-ink-900">
          Set a new password
        </h1>

        <div className="mb-4 flex flex-col gap-1">
          <label
            htmlFor="newPassword"
            className="text-sm text-ink-700"
          >
            New Password
          </label>

          <input
            id="newPassword"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded border border-line-200 bg-paper-0 px-3 py-3 text-base outline-none focus:border-2 focus:border-petrol-600"
          />
        </div>

        <div className="mb-4 flex flex-col gap-1">
          <label
            htmlFor="confirmPassword"
            className="text-sm text-ink-700"
          >
            Confirm New Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded border border-line-200 bg-paper-0 px-3 py-3 text-base outline-none focus:border-2 focus:border-petrol-600"
          />
        </div>

        {error && (
          <p className="mb-4 text-xs text-danger-600">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Saving..." : "Set New Password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}