"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Users, BookOpen, CreditCard, TrendingUp, Award, MessageSquare, DollarSign, UserPlus } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function AdminDashboard() {
  useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/admin/dashboard`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setStats(d.data || d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "border-l-blue-500", iconBg: "bg-blue-100", iconFg: "text-blue-600" },
    { label: "Active Courses", value: stats?.totalCourses || 0, icon: BookOpen, color: "border-l-green-500", iconBg: "bg-green-100", iconFg: "text-green-600" },
    { label: "Total Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "border-l-purple-500", iconBg: "bg-purple-100", iconFg: "text-purple-600" },
    { label: "Total Payments", value: stats?.totalPayments || 0, icon: CreditCard, color: "border-l-orange-500", iconBg: "bg-orange-100", iconFg: "text-orange-600" },
    { label: "Enrollments", value: stats?.totalEnrollments || 0, icon: TrendingUp, color: "border-l-cyan-500", iconBg: "bg-cyan-100", iconFg: "text-cyan-600" },
    { label: "Certificates", value: stats?.totalCertificates || 0, icon: Award, color: "border-l-yellow-500", iconBg: "bg-yellow-100", iconFg: "text-yellow-600" },
    { label: "Total Inquiries", value: stats?.totalInquiries || 0, icon: MessageSquare, color: "border-l-pink-500", iconBg: "bg-pink-100", iconFg: "text-pink-600" },
    { label: "New Leads", value: stats?.newInquiries || 0, icon: UserPlus, color: "border-l-indigo-500", iconBg: "bg-indigo-100", iconFg: "text-indigo-600" },
  ];

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Admin Analytics</h1>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.label} className={`p-6 border-l-4 ${card.color}`}>
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} ${card.iconFg}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
