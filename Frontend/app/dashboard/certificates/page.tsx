"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function CertificatesPage() {
  useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/certificates/my`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setCertificates(d.data || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">My Certificates</h1>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {certificates.map((cert: any) => (
            <Card key={cert.id} className="p-6 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-50">
                <Award className="h-7 w-7 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {cert.course?.title || "Course Certificate"}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  Issued on {new Date(cert.issuedAt).toLocaleDateString()}
                </p>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Award className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No certificates yet</h3>
          <p className="text-gray-500">Complete a course to earn your first certificate.</p>
        </Card>
      )}
    </div>
  );
}
