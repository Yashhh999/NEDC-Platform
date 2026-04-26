"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { User } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await fetch(`${API_BASE}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Profile</h1>

      <div className="max-w-2xl">
        {/* Avatar section */}
        <Card className="p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
              {user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name || "User"}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 uppercase">
                {user?.role || "user"}
              </span>
            </div>
          </div>
        </Card>

        {/* Edit form */}
        <Card className="p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Update Profile</h3>
          <form onSubmit={handleUpdate} className="space-y-5">
            <Input
              label="Display Name"
              value={user?.name || ""}
              disabled
              className="bg-gray-50"
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {success && (
              <p className="text-sm text-green-600 font-medium">✓ Profile updated successfully</p>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
