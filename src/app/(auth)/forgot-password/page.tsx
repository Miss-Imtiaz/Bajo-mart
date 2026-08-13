"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { requestPasswordReset } from "@/actions/password-reset.actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset(email);
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-100 px-4">
      <div className="w-full max-w-sm rounded-card border border-line-200 bg-paper-0 p-8">
        <h1 className="mb-1 text-2xl font-bold text-ink-900">Reset your password</h1>
        <p className="mb-6 text-sm text-ink-700">
          Enter your account email and we'll send you a link to set a new password.
        </p>

        {submitted ? (
          <p className="rounded bg-confirm-100 px-3 py-3 text-sm text-confirm-600">
            If that email is registered, a reset link has been sent. Check your inbox
            (and spam folder) — the link expires in 1 hour.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm text-ink-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded border border-line-200 bg-paper-0 px-3 py-3 text-base outline-none focus:border-2 focus:border-petrol-600"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <a href="/login" className="mt-4 block text-center text-sm text-petrol-600">
          Back to Log In
        </a>
      </div>
    </div>
  );
}
