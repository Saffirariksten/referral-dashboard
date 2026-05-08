"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Order } from "@/app/generated/prisma";

type Props = {
  displayName: string;
  referralCode: string;
  commissionRate: number;
  discountRate: number;
  orders: Order[];
};

function getMonthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleString("en-GB", { month: "long", year: "numeric" });
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function CreatorDashboardClient({
  displayName,
  referralCode,
  commissionRate,
  discountRate,
  orders,
}: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [tab, setTab] = useState<"month" | "today">("month");

  const todayStr = now.toISOString().split("T")[0];

  const monthOrders = useMemo(
    () =>
      orders.filter((o) => {
        const d = new Date(o.orderedAt);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      }),
    [orders, year, month]
  );

  const todayOrders = useMemo(
    () => orders.filter((o) => new Date(o.orderedAt).toISOString().split("T")[0] === todayStr),
    [orders, todayStr]
  );

  const activeOrders = tab === "today" ? todayOrders : monthOrders;
  const totalNet = activeOrders.reduce((s, o) => s + o.netAmount, 0);
  const totalCommission = activeOrders.reduce((s, o) => s + o.commission, 0);

  const biggestOrder = [...monthOrders].sort((a, b) => b.netAmount - a.netAmount)[0] ?? null;

  // Build daily chart data for selected month
  const chartData = useMemo(() => {
    const days = getDaysInMonth(year, month);
    const dayMap: Record<number, number> = {};
    monthOrders.forEach((o) => {
      const d = new Date(o.orderedAt).getDate();
      dayMap[d] = (dayMap[d] ?? 0) + o.netAmount;
    });
    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      revenue: dayMap[i + 1] ?? 0,
    }));
  }, [monthOrders, year, month]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    if (isCurrentMonth) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div className="space-y-5 max-w-2xl mx-auto md:mx-0">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Hi, {displayName}!</h1>
        <p className="text-gray-500 mt-1 text-sm">Here&apos;s your referral overview.</p>
      </div>

      {/* Referral code card */}
      <div className="bg-white border rounded-xl p-5">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Your referral code</p>
        <code className="text-3xl font-bold tracking-wider">{referralCode}</code>
        <div className="flex gap-6 mt-4 text-sm">
          <div>
            <p className="text-gray-400">Customer discount</p>
            <p className="font-semibold text-base">{(discountRate * 100).toFixed(0)}% off</p>
          </div>
          <div>
            <p className="text-gray-400">Your commission</p>
            <p className="font-semibold text-base">{(commissionRate * 100).toFixed(0)}% of net</p>
          </div>
        </div>
      </div>

      {/* Month card */}
      <div className="bg-white border rounded-xl p-5 space-y-4">
        {/* Month nav + tabs */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-1 rounded hover:bg-gray-100 text-xl leading-none"
            >
              ←
            </button>
            <span className="font-semibold text-base min-w-[130px] text-center">
              {getMonthLabel(year, month)}
            </span>
            <button
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="p-1 rounded hover:bg-gray-100 text-xl leading-none disabled:opacity-30"
            >
              →
            </button>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1 text-sm">
            <button
              onClick={() => setTab("month")}
              className={`px-3 py-1.5 rounded-md transition-all text-sm font-medium ${
                tab === "month" ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              This month
            </button>
            <button
              onClick={() => setTab("today")}
              className={`px-3 py-1.5 rounded-md transition-all text-sm font-medium ${
                tab === "today" ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              Today
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{tab === "today" ? "Today's orders" : "Orders"}</p>
            <p className="text-2xl font-bold">{activeOrders.length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Net revenue</p>
            <p className="text-2xl font-bold">€{totalNet.toFixed(0)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Commission</p>
            <p className="text-2xl font-bold">€{totalCommission.toFixed(0)}</p>
          </div>
        </div>

        {/* Chart or today list */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Revenue trend</p>
          {tab === "month" ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cbc1b0" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#cbc1b0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={Math.floor(chartData.length / 5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `€${v}`} />
                <Tooltip formatter={(v) => [`€${Number(v).toFixed(2)}`, "Revenue"]} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#a89a87"
                  strokeWidth={2.5}
                  fill="url(#revGrad)"
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    if (!payload.revenue) return <g key={props.key} />;
                    return <circle key={props.key} cx={cx} cy={cy} r={4} fill="#a89a87" stroke="white" strokeWidth={2} />;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="space-y-2">
              {todayOrders.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">No orders today yet.</p>
              ) : (
                todayOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex justify-between items-center border rounded-lg px-4 py-3 text-sm"
                  >
                    <span className="font-medium">{o.orderNumber ?? "Order"}</span>
                    <span className="text-gray-500">Net €{o.netAmount.toFixed(2)}</span>
                    <span className="font-bold">+€{o.commission.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Biggest order */}
      {biggestOrder && tab === "month" && (
        <div className="bg-white border rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">🏆 Biggest order this month</p>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="font-semibold text-base">{biggestOrder.orderNumber ?? "Order"}</p>
              <p className="text-sm text-gray-400">
                {new Date(biggestOrder.orderedAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Net order</p>
              <p className="font-bold text-lg">€{biggestOrder.netAmount.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Your commission</p>
              <p className="font-bold text-lg text-green-600">€{biggestOrder.commission.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* All orders (mobile cards / desktop table) */}
      <Card>
        <CardHeader>
          <CardTitle>All orders via your code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="md:hidden space-y-3">
            {orders.length === 0 && (
              <p className="text-center text-gray-400 py-6 text-sm">No orders yet. Share your code to get started!</p>
            )}
            {orders.map((o) => (
              <div key={o.id} className="border rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{o.orderNumber ?? "Order"}</p>
                    <p className="text-gray-400 text-xs">{new Date(o.orderedAt).toLocaleDateString("en-GB")}</p>
                  </div>
                  <Badge variant="secondary">{o.source}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div><p>Gross</p><p className="text-gray-800 font-medium">€{o.grossAmount.toFixed(2)}</p></div>
                  <div><p>Discount</p><p className="text-gray-800 font-medium">-€{o.discountAmount.toFixed(2)}</p></div>
                  <div><p>Net</p><p className="text-gray-800 font-medium">€{o.netAmount.toFixed(2)}</p></div>
                  <div><p>Commission</p><p className="font-bold text-gray-900">€{o.commission.toFixed(2)}</p></div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Order #</th>
                <th className="pb-2 font-medium">Gross</th>
                <th className="pb-2 font-medium">Discount</th>
                <th className="pb-2 font-medium">Net</th>
                <th className="pb-2 font-medium">Commission</th>
                <th className="pb-2 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-2">{new Date(o.orderedAt).toLocaleDateString("en-GB")}</td>
                  <td className="py-2">{o.orderNumber ?? "—"}</td>
                  <td className="py-2">€{o.grossAmount.toFixed(2)}</td>
                  <td className="py-2">-€{o.discountAmount.toFixed(2)}</td>
                  <td className="py-2">€{o.netAmount.toFixed(2)}</td>
                  <td className="py-2 font-medium">€{o.commission.toFixed(2)}</td>
                  <td className="py-2"><Badge variant="secondary">{o.source}</Badge></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-400">No orders yet. Share your code to get started!</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
