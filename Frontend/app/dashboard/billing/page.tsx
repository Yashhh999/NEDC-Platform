"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { fetcher } from "@/lib/api/fetcher";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  PAID: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
  FAILED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  REFUNDED: { icon: XCircle, color: "text-gray-600", bg: "bg-gray-50" },
};

export default function BillingPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher<any>("/payments/my")
      .then((d) => setPayments(d.data || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Billing &amp; Payments</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      ) : payments.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Order ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment: any) => {
                  const config = statusConfig[payment.status] || statusConfig.PENDING;
                  const StatusIcon = config.icon;
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {payment.course?.title || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        ₹{payment.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                        {payment.orderId?.slice(0, 20)}...
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-500">Your payment history will appear here.</p>
        </Card>
      )}
    </div>
  );
}
