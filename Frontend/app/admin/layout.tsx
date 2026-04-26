"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  MessageSquare,
  Award,
  Settings,
  LogOut,
  ChevronRight,
  FileText,
  Image,
} from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Analytics", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/leads", label: "Leads", icon: MessageSquare },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/blog", label: "Blog CMS", icon: FileText },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-white transition-transform -translate-x-full sm:translate-x-0">
        <div className="flex h-20 items-center border-b border-slate-800 px-6">
          <Link href="/" className="flex items-center gap-2 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold">
              N
            </div>
            <span className="text-xl font-bold tracking-tight">Admin Panel</span>
          </Link>
        </div>
        <div className="flex h-[calc(100%-5rem)] flex-col overflow-y-auto px-3 py-6">
          <ul className="space-y-1 flex-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600/20 text-blue-400"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <link.icon className={`h-5 w-5 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                    {link.label}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4 text-blue-400" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-slate-800 pt-4 mt-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5 text-slate-500" />
              Back to Dashboard
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-red-900/30 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-5 w-5 text-slate-500" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-0 sm:ml-64 flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
