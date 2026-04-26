"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { fetcher, API_BASE_URL } from "@/lib/api/fetcher";
import { BookOpen, Clock, Trophy, TrendingUp, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const planColors: Record<string, { bg: string; fg: string; badge: string }> = {
  FREE: { bg: "bg-gray-100", fg: "text-gray-700", badge: "bg-gray-200 text-gray-700" },
  BASIC: { bg: "bg-blue-50", fg: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
  PRO: { bg: "bg-purple-50", fg: "text-purple-700", badge: "bg-purple-100 text-purple-700" },
  ENTERPRISE: { bg: "bg-indigo-50", fg: "text-indigo-700", badge: "bg-indigo-100 text-indigo-700" },
};

interface ProgressItem {
  courseId: string;
  course: { id: string; title: string };
  totalLessons: number;
  completedLessons: number;
  percentage: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [enrollmentProgress, setEnrollmentProgress] = useState<Record<string, ProgressItem>>({});

  useEffect(() => {
    // Fetch profile
    fetcher<any>("/users/profile")
      .then((d) => setProfile(d.data || d))
      .catch(() => {});

    // Fetch subscription
    fetcher<any>("/subscriptions/my")
      .then((d) => setSubscription(d.data || d))
      .catch(() => {});

    // Fetch certificates count
    fetcher<any>("/certificates/my")
      .then((d) => {
        const data = d.data || d || [];
        setCertificates(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    // Fetch progress for all enrolled courses
    fetcher<any>("/progress")
      .then((d) => {
        const data = d.data || d || [];
        const list: ProgressItem[] = Array.isArray(data) ? data : [];
        setProgressList(list);
        // Build a lookup by courseId for enrollment cards
        const map: Record<string, ProgressItem> = {};
        list.forEach((p) => { if (p.courseId) map[p.courseId] = p; });
        setEnrollmentProgress(map);
      })
      .catch(() => {});
  }, []);

  const plan = subscription?.plan || "FREE";
  const colors = planColors[plan] || planColors.FREE;

  const completedCourses = progressList.filter((p) => p.percentage === 100).length;

  const stats = [
    { label: "Enrolled Courses", value: profile?.totalEnrollments || 0, icon: BookOpen, color: "border-l-blue-500", bg: "bg-blue-100", fg: "text-blue-600" },
    { label: "Completed Courses", value: completedCourses, icon: Trophy, color: "border-l-green-500", bg: "bg-green-100", fg: "text-green-600" },
    { label: "Hours Learned", value: "0", icon: Clock, color: "border-l-purple-500", bg: "bg-purple-100", fg: "text-purple-600" },
    { label: "Certificates Earned", value: certificates.length, icon: TrendingUp, color: "border-l-orange-500", bg: "bg-orange-100", fg: "text-orange-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || "Learner"}!
        </h1>
        <p className="mt-2 text-gray-600">Track your progress and continue learning.</p>
      </div>

      {/* Active Plan Card */}
      <Card className={`mb-8 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${colors.bg}`}>
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.badge}`}>
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-lg ${colors.fg}`}>
                {plan} Plan
              </h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}>
                Active
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {plan === "FREE"
                ? "Upgrade for unlimited access to all courses"
                : `Renews ${subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : "—"}`}
            </p>
          </div>
        </div>
        {plan === "FREE" && (
          <Link href="/pricing">
            <Button size="sm">
              Upgrade Plan <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </Card>

      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={`p-6 flex items-center gap-4 border-l-4 ${stat.color}`}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bg} ${stat.fg}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Continue Learning */}
      <h2 className="mb-4 text-xl font-bold text-gray-900">Continue Learning</h2>
      {profile?.enrollments?.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profile.enrollments.map((enrollment: any) => {
            const courseId = enrollment.courseId || enrollment.course?.id;
            const prog = enrollmentProgress[courseId];
            const pct = prog?.percentage || 0;
            return (
              <Link href={`/dashboard/learn/${courseId}`} key={enrollment.id}>
                <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-semibold text-gray-900 mb-2">{enrollment.course?.title}</h3>
                  <p className="text-sm text-gray-500">Enrolled {new Date(enrollment.createdAt).toLocaleDateString()}</p>
                  <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">{pct}% complete</p>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-gray-500">
          No enrolled courses yet. <a href="/courses" className="text-blue-600 font-medium">Browse courses</a>
        </Card>
      )}
    </div>
  );
}
