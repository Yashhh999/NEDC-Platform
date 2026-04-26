import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BlogPostPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <article className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Blog Post</span>
            <h1 className="mt-2 text-4xl font-extrabold text-gray-900 leading-tight mb-6">
              Blog Post Title
            </h1>
            <div className="text-gray-500 text-sm mb-10">Published — 5 min read</div>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
              <p>
                This page will dynamically load blog content from the backend API.
                Each blog post will feature rich text content, cover images, and author attribution.
              </p>
              <p>
                Connect this page to the <code>/api/blog/:slug</code> endpoint to fetch real content.
              </p>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
