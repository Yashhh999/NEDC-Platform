"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Globe, Shield, Bell } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Platform Settings</h1>

      <div className="max-w-3xl space-y-8">
        {/* General */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Globe className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">General</h2>
          </div>
          <div className="space-y-5">
            <Input label="Platform Name" defaultValue="NEDC" />
            <Input label="Support Email" defaultValue="info@nedc.in" />
            <Input label="Support Phone" defaultValue="+91 98765 43210" />
          </div>
        </Card>

        {/* Payment */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Payment Gateway</h2>
          </div>
          <div className="space-y-5">
            <Input label="Razorpay Key ID" placeholder="rzp_live_..." type="password" />
            <Input label="Razorpay Key Secret" placeholder="••••••••" type="password" />
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Bell className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Send email on new enrollment</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Send email on new inquiry</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Send weekly analytics report</span>
            </label>
          </div>
        </Card>

        <Button size="lg">Save All Settings</Button>
      </div>
    </div>
  );
}
