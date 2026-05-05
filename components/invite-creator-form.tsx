"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function InviteCreatorForm() {
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
    const res = await fetch("/api/admin/creators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        referralCode: data.get("referralCode"),
        commissionRate: Number(data.get("commissionRate")) / 100,
        discountRate: Number(data.get("discountRate")) / 100,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setSuccess("Invitation sent! The creator will receive an email to set up their account.");
    setLoading(false);
    setTimeout(() => router.push("/admin/creators"), 2000);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" name="name" placeholder="e.g. Sarah" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" placeholder="sarah@example.com" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="referralCode">Referral code</Label>
            <Input id="referralCode" name="referralCode" placeholder="e.g. SARAH10" required />
            <p className="text-xs text-gray-500">Customers use this code at checkout for their discount.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="commissionRate">Commission (%)</Label>
              <Input
                id="commissionRate"
                name="commissionRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                defaultValue="10"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="discountRate">Customer discount (%)</Label>
              <Input
                id="discountRate"
                name="discountRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                defaultValue="10"
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Sending invitation…" : "Send invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
