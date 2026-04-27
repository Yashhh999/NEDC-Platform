"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<"pending" | "ok" | "error">("pending");
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification link is missing the token.");
      return;
    }
    fetch(`${API_BASE}/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus("ok");
          setMessage(body.data?.message || body.message || "Email verified.");
        } else {
          setStatus("error");
          const m = Array.isArray(body.message) ? body.message.join(", ") : body.message;
          setMessage(m || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not reach the server. Please try again later.");
      });
  }, [token]);

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900">
        {status === "ok" ? "Email verified" : status === "error" ? "Verification failed" : "Verifying email"}
      </h1>
      <p className="mt-3 text-sm text-gray-600">{message}</p>
      <div className="mt-6">
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Continue to sign in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8">
        <Suspense fallback={null}>
          <VerifyEmailInner />
        </Suspense>
      </Card>
    </div>
  );
}
