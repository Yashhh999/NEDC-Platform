"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Home,
  BookOpen,
  Award,
  CreditCard,
  User,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // ── Route Guard: Show spinner while auth loads ──
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  // ── Route Guard: Redirect unauthenticated users to login ──
  if (!user) {
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white transition-transform -translate-x-full sm:translate-x-0">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-gray-200 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
              N
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">NEDC</span>
          </Link>
        </div>

        <div className="flex h-[calc(100%-5rem)] flex-col overflow-y-auto px-3 py-6">
          {/* User info */}
          <div className="mb-6 px-3">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "User"}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
          </div>

          {/* Nav links */}
          <ul className="space-y-1 flex-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <link.icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                    {link.label}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4 text-blue-400" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Logout */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5 text-gray-400" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-0 sm:ml-64 flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
