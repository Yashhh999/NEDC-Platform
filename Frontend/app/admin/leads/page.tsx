"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { MessageSquare, Trash2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700",
  CONTACTED: "bg-yellow-50 text-yellow-700",
  CONVERTED: "bg-green-50 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

export default function AdminLeadsPage() {
  useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/inquiries`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setLeads(d.data || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${API_BASE}/inquiries/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json"},
        credentials: "include",
      body: JSON.stringify({ status }),
    });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await fetch(`${API_BASE}/inquiries/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Lead Tracking</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      ) : leads.length > 0 ? (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Card key={lead.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                    <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-semibold ${statusColors[lead.status] || statusColors.NEW}`}>
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{lead.email} {lead.phone && `• ${lead.phone}`}</p>
                  <p className="text-sm text-gray-700">{lead.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(lead.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  <Button variant="ghost" size="sm" onClick={() => deleteLead(lead.id)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No leads yet</h3>
          <p className="text-gray-500">Inquiries from the contact form will appear here.</p>
        </Card>
      )}
    </div>
  );
}
