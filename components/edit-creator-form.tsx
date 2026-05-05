"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Creator } from "@/app/generated/prisma";

export function EditCreatorForm({ creator }: { creator: Creator }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const data = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/creators/${creator.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: data.get("displayName"),
        referralCode: data.get("referralCode"),
        commissionRate: Number(data.get("commissionRate")) / 100,
        discountRate: Number(data.get("discountRate")) / 100,
        active: data.get("active") === "true",
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setSuccess("Saved.");
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Display name</Label>
            <Input name="displayName" defaultValue={creator.displayName} required />
          </div>
          <div className="space-y-1">
            <Label>Referral code</Label>
            <Input name="referralCode" defaultValue={creator.referralCode} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Commission (%)</Label>
              <Input
                name="commissionRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                defaultValue={(creator.commissionRate * 100).toFixed(1)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Customer discount (%)</Label>
              <Input
                name="discountRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                defaultValue={(creator.discountRate * 100).toFixed(1)}
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <select name="active" defaultValue={creator.active ? "true" : "false"} className="w-full border rounded px-3 py-2 text-sm">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
