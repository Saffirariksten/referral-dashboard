"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Order, Creator } from "@/app/generated/prisma";

export function OrderActions({ order, creator }: { order: Order; creator: Creator }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [grossAmount, setGrossAmount] = useState(order.grossAmount.toString());

  const gross = parseFloat(grossAmount) || 0;
  const discount = gross * creator.discountRate;
  const net = gross - discount;
  const commission = net * creator.commissionRate;

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumber: data.get("orderNumber"),
        grossAmount: parseFloat(data.get("grossAmount") as string),
        customerEmail: data.get("customerEmail"),
        notes: data.get("notes"),
        orderedAt: data.get("orderedAt"),
      }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Something went wrong."); setLoading(false); return; }
    setEditOpen(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
    if (res.ok) { setDeleteOpen(false); router.refresh(); }
    else { setError("Could not delete order."); setLoading(false); setDeleteOpen(false); }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>Edit</Button>
      <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>Delete</Button>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit order</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1">
              <Label>Order number</Label>
              <Input name="orderNumber" defaultValue={order.orderNumber ?? ""} placeholder="#1001" />
            </div>
            <div className="space-y-1">
              <Label>Gross amount (€)</Label>
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
            {gross > 0 && (
              <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount ({(creator.discountRate * 100).toFixed(0)}%)</span>
                  <span>-€{discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Net amount</span>
                  <span>€{net.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Commission ({(creator.commissionRate * 100).toFixed(0)}%)</span>
                  <span>€{commission.toFixed(2)}</span>
                </div>
              </div>
            )}
            <div className="space-y-1">
              <Label>Order date</Label>
              <Input
                name="orderedAt"
                type="date"
                defaultValue={new Date(order.orderedAt).toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Customer email</Label>
              <Input name="customerEmail" type="email" defaultValue={order.customerEmail ?? ""} />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea name="notes" rows={2} defaultValue={order.notes ?? ""} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete order?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">
            This will permanently delete order {order.orderNumber ?? order.id}. This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting…" : "Yes, delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
