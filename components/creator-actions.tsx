"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CreatorActions({ creatorId, hasAccount }: { creatorId: string; hasAccount: boolean }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/admin/creators/${creatorId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/creators");
    } else {
      const json = await res.json();
      setError(json.error ?? "Something went wrong.");
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setMessage("");
    setError("");
    const res = await fetch(`/api/admin/creators/${creatorId}/resend-invite`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
    } else {
      setMessage("Invitation email sent successfully.");
    }
    setResending(false);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {!hasAccount && (
        <Button variant="outline" size="sm" onClick={handleResend} disabled={resending}>
          {resending ? "Sending…" : "Resend invitation"}
        </Button>
      )}
      <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
        Delete creator
      </Button>

      {message && <p className="text-sm text-green-600 self-center">{message}</p>}
      {error && <p className="text-sm text-red-600 self-center">{error}</p>}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete creator?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            This will permanently delete this creator and all their orders. This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Yes, delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
