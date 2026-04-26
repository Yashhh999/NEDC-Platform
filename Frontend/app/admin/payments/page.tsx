"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  PAID: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
  FAILED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  REFUNDED: { icon: XCircle, color: "text-gray-600", bg: "bg-gray-50" },
};

export default function AdminPaymentsPage() {
  useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/admin/payments`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setPayments(d.data || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Payment Reports</h1>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Order ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-5 animate-pulse rounded bg-gray-200 w-3/4" />
                      </td>
                    </tr>
                  ))
                : payments.map((p) => {
                    const config = statusConfig[p.status] || statusConfig.PENDING;
                    const StatusIcon = config.icon;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{p.user?.name || p.user?.email || "—"}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{p.course?.title || "—"}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">₹{p.amount?.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.color}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                          {p.orderId?.slice(0, 20)}...
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
