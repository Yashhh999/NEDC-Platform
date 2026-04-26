"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signup(name, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white">
            N
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600">Start your entrepreneurship journey today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email address" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" placeholder="Create a password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
