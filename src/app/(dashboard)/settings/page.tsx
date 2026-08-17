"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { updateOwnProfile } from "@/actions/user.actions";

export default function SettingsPage() {
  const { data: session, update } = useSession();

  const [name, setName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword && newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);
    const result = await updateOwnProfile({
      name,
      email,
      currentPassword,
      newPassword: newPassword || undefined,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    update();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Your Account">
        <form id="settings-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm text-ink-700">
              Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded border border-line-200 bg-paper-0 px-3 py-3 text-base outline-none focus:border-2 focus:border-petrol-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-ink-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded border border-line-200 bg-paper-0 px-3 py-3 text-base outline-none focus:border-2 focus:border-petrol-600"
            />
          </div>

          <hr className="border-line-200" />

          <p className="text-sm text-ink-700">
            To change your password, fill in a new one below. Leave blank to keep your current password.
          </p>

          <PasswordInput
            label="New Password"
            hint="(optional)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />

          {newPassword && (
            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          )}

          <hr className="border-line-200" />

          <PasswordInput
            label="Current Password"
            hint="(required to save any change)"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && <p className="text-xs text-danger-600">{error}</p>}
          {success && (
            <p className="rounded bg-confirm-100 px-3 py-2 text-sm text-confirm-600">Saved successfully.</p>
          )}
        </form>
      </Card>

      <div className="sticky bottom-0 -mx-4 border-t border-line-200 bg-paper-0 px-4 py-4">
        <Button
          type="submit"
          form="settings-form"
          disabled={loading}
          className="w-full tablet:w-auto"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}