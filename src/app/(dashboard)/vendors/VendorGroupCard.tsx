"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createVendor, renameVendor, setVendorActive, deleteVendor } from "@/actions/vendor.actions";
import type { Vendor, VendorGroup } from "@prisma/client";

export function VendorGroupCard({
  title,
  group,
  vendors,
}: {
  title: string;
  group: VendorGroup;
  vendors: Vendor[];
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    await createVendor(newName, group);
    setNewName("");
    setLoading(false);
  }

  async function handleRename(id: string) {
    if (!editingName.trim()) return;
    await renameVendor(id, editingName);
    setEditingId(null);
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    await setVendorActive(id, !isActive);
  }

  async function handleDelete(id: string) {
    setDeleteError(null);
    const result = await deleteVendor(id);
    if (!result.success) {
      setDeleteError(result.error ?? "Could not delete this vendor.");
      setConfirmDeleteId(null);
      return;
    }
    setConfirmDeleteId(null);
  }

  return (
    <Card title={title}>
      {deleteError && (
        <p className="rounded bg-danger-100 px-3 py-2 text-sm text-danger-600">{deleteError}</p>
      )}
      <ul className="flex flex-col divide-y divide-line-200">
        {vendors.map((vendor) => (
          <li key={vendor.id} className="flex flex-col gap-2 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {editingId === vendor.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleRename(vendor.id)}
                  onKeyDown={(e) => e.key === "Enter" && handleRename(vendor.id)}
                  className="min-w-0 flex-1 rounded border border-line-200 px-2 py-1 text-sm outline-none focus:border-2 focus:border-petrol-600"
                />
              ) : (
                <span className={vendor.isActive ? "text-ink-900" : "text-ink-400 line-through"}>
                  {vendor.name}
                </span>
              )}

              <div className="flex flex-wrap gap-2">
                {editingId !== vendor.id && (
                  <Button
                    variant="secondary"
                    className="px-3 py-1 text-xs"
                    onClick={() => {
                      setEditingId(vendor.id);
                      setEditingName(vendor.name);
                    }}
                  >
                    Edit
                  </Button>
                )}
                <Button
                  variant={vendor.isActive ? "destructive" : "secondary"}
                  className="px-3 py-1 text-xs"
                  onClick={() => handleToggleActive(vendor.id, vendor.isActive)}
                >
                  {vendor.isActive ? "Deactivate" : "Reactivate"}
                </Button>
                <Button
                  variant="destructive"
                  className="px-3 py-1 text-xs"
                  onClick={() => {
                    setDeleteError(null);
                    setConfirmDeleteId(vendor.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>

            {confirmDeleteId === vendor.id && (
              <div className="flex flex-col gap-2 rounded bg-danger-100 px-3 py-2 tablet:flex-row tablet:items-center tablet:justify-between">
                <span className="text-sm text-danger-600">
                  Permanently delete "{vendor.name}"? This can't be undone.
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    className="px-3 py-1 text-xs"
                    onClick={() => handleDelete(vendor.id)}
                  >
                    Yes, Delete
                  </Button>
                  <Button
                    variant="secondary"
                    className="px-3 py-1 text-xs"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-2 tablet:flex-row">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New vendor name"
          className="min-w-0 flex-1 rounded border border-line-200 px-3 py-2 text-sm outline-none focus:border-2 focus:border-petrol-600"
        />
        <Button type="submit" disabled={loading} className="px-4 py-2 text-sm">
          Add
        </Button>
      </form>
    </Card>
  );
}
