"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

const blogPosts = [
  {
    slug: "how-to-register-gst",
    title: "How to Register for GST — A Complete Startup Guide",
    excerpt: "Step-by-step guide to GST registration for Indian startups. Learn about eligibility, documents needed, and the online process.",
    date: "Apr 20, 2026",
    readTime: "8 min read",
    category: "GST & Legal",
    color: "bg-blue-100",
  },
  {
    slug: "pitch-deck-essentials",
    title: "10 Essential Slides Every Pitch Deck Needs",
    excerpt: "Fundraising starts with a compelling pitch. Here are the 10 slides investors want to see in your startup deck.",
    date: "Apr 15, 2026",
    readTime: "6 min read",
    category: "Fundraising",
    color: "bg-purple-100",
  },
  {
    slug: "digital-marketing-budget",
    title: "How to Set a Digital Marketing Budget for Your Startup",
    excerpt: "Learn how to allocate your limited marketing budget effectively across SEO, social media, and paid advertising.",
    date: "Apr 10, 2026",
    readTime: "5 min read",
    category: "Marketing",
    color: "bg-green-100",
  },
  {
    slug: "business-plan-mistakes",
    title: "5 Common Business Plan Mistakes to Avoid",
    excerpt: "Many entrepreneurs make these critical errors in their business plans. Learn how to avoid them and impress investors.",
    date: "Apr 5, 2026",
    readTime: "4 min read",
    category: "Entrepreneurship",
    color: "bg-orange-100",
  },
];

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
                Blog & Resources
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Insights, guides, and tips for aspiring entrepreneurs.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {blogPosts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.slug}>
                  <Card className="flex flex-col overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow h-full">
                    <div className={`h-48 ${post.color} transition-transform group-hover:scale-105`} />
                    <div className="p-6 flex-1 flex flex-col">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                        {post.category}
                      </span>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 mb-4 flex-1">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{post.date}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}