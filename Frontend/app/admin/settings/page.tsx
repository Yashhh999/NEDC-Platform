"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Globe, Lock, Bell } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Platform Settings</h1>

      <div className="max-w-3xl space-y-8">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Globe className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">General</h2>
          </div>
          <p className="text-sm text-gray-600">
            Non-sensitive runtime settings (platform name, support contact,
            notification toggles) are managed through the
            {" "}<code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">/api/settings</code> endpoint.
            Only an allowlist of keys can be persisted; any unknown key is
            rejected by the backend.
          </p>
        </Card>

        <Card className="p-8 border border-amber-200 bg-amber-50/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Payment Gateway</h2>
          </div>
          <p className="text-sm text-gray-700">
            Razorpay credentials (<code className="rounded bg-white px-1.5 py-0.5 text-xs">RAZORPAY_KEY_ID</code>,{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">RAZORPAY_KEY_SECRET</code>,{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">RAZORPAY_WEBHOOK_SECRET</code>)
            are server-side environment variables. They are{" "}
            <strong>never</strong> entered, displayed, or transmitted through
            the admin UI. Rotate them via your hosting provider&apos;s secret
            manager and restart the backend.
          </p>
        </Card>

        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Bell className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <p className="text-sm text-gray-600">
            Notification toggles will be wired to the settings allowlist keys
            (<code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">notifications.email_on_enrollment</code>,
            etc.) when the mailer integration ships.
          </p>
        </Card>
      </div>
    </div>
  );
}
