"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Creator } from "@/app/generated/prisma";

export function AddOrderDialog({ creators }: { creators: Creator[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [grossAmount, setGrossAmount] = useState("");
  const [selectedCreatorId, setSelectedCreatorId] = useState(creators[0]?.id ?? "");

  const selectedCreator = creators.find((c) => c.id === selectedCreatorId);
  const gross = parseFloat(grossAmount) || 0;
  const discount = selectedCreator ? gross * selectedCreator.discountRate : 0;
  const net = gross - discount;
  const commission = selectedCreator ? net * selectedCreator.commissionRate : 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creatorId: data.get("creatorId"),
        orderNumber: data.get("orderNumber") || null,
        grossAmount: parseFloat(data.get("grossAmount") as string),
        customerEmail: data.get("customerEmail") || null,
        notes: data.get("notes") || null,
        orderedAt: data.get("orderedAt"),
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>Add order manually</Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Creator</Label>
            <select
              name="creatorId"
              value={selectedCreatorId}
              onChange={(e) => setSelectedCreatorId(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            >
              {creators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName} ({c.referralCode})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Order number (optional)</Label>
            <Input name="orderNumber" placeholder="e.g. #1001" />
          </div>
          <div className="space-y-1">
            <Label>Gross order amount (€)</Label>
            <Input
              name="grossAmount"
              type="number"
              min="0"
              step="0.01"
              value={grossAmount}
              onChange={(e) => setGrossAmount(e.target.value)}
              required
            />
          </div>
          {gross > 0 && selectedCreator && (
            <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Discount ({(selectedCreator.discountRate * 100).toFixed(0)}%)</span>
                <span>-€{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Net amount</span>
                <span>€{net.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Commission ({(selectedCreator.commissionRate * 100).toFixed(0)}%)</span>
                <span>€{commission.toFixed(2)}</span>
              </div>
            </div>
          )}
          <div className="space-y-1">
            <Label>Order date</Label>
            <Input
              name="orderedAt"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Customer email (optional)</Label>
            <Input name="customerEmail" type="email" />
          </div>
          <div className="space-y-1">
            <Label>Notes (optional)</Label>
            <Textarea name="notes" rows={2} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adding…" : "Add order"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
