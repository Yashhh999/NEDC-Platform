"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Send } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setError("Failed to submit your inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
                Contact Us
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Have a question or interested in our programs? We&#39;d love to hear from you.
              </p>
            </div>

            <div className="grid gap-12 lg:grid-cols-2 max-w-5xl mx-auto">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600">NEDC Office, Innovation Hub, New Delhi, India 110001</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">info@nedc.in</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <Card className="p-8">
                {success ? (
                  <div className="text-center py-12">
                    <div className="mb-4 text-5xl">✅</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h3>
                    <p className="text-gray-600">Your inquiry has been submitted. We&#39;ll get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    <Input label="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <div className="w-full flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Message</label>
                      <textarea
                        className="flex min-h-[120px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                        placeholder="Tell us about your inquiry..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Submitting..." : "Send Message"} <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
