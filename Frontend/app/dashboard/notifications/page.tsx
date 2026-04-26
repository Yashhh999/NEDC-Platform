"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/api/fetcher";
import { Bell, Check, Info, AlertTriangle, CheckCircle } from "lucide-react";

const typeIcons: Record<string, any> = {
  INFO: Info,
  SUCCESS: CheckCircle,
  WARNING: AlertTriangle,
  ALERT: AlertTriangle,
};

const typeColors: Record<string, string> = {
  INFO: "bg-blue-50 text-blue-600",
  SUCCESS: "bg-green-50 text-green-600",
  WARNING: "bg-yellow-50 text-yellow-600",
  ALERT: "bg-red-50 text-red-600",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher<any>("/notifications")
      .then((d) => setNotifications(d.data || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await fetcher("/notifications/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif: any) => {
            const IconComp = typeIcons[notif.type] || Info;
            const colorClass = typeColors[notif.type] || typeColors.INFO;
            return (
              <Card
                key={notif.id}
                className={`p-5 flex items-start gap-4 transition-colors ${
                  notif.read ? "opacity-60" : ""
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                  <IconComp className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">{notif.title}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.read && (
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500 mt-2" />
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-500">No notifications to show.</p>
        </Card>
      )}
    </div>
  );
}
