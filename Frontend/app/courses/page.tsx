"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CourseCard } from "@/components/cards/course-card";
import { Search } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const categories = ["All", "Entrepreneurship", "GST & Legal", "Marketing", "Finance", "Leadership"];

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch(`${API_BASE}/courses`)
      .then((r) => r.json())
      .then((d) => setCourses(d.data || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Explore Courses</h1>
              <p className="text-lg text-gray-600">Find the right course to advance your entrepreneurship journey.</p>
            </div>

            {/* Search + Filter */}
            <div className="mb-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                      activeCategory === cat
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Course grid */}
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-200" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((course) => (
                  <CourseCard
                    key={course.id}
                    title={course.title}
                    rating={4.5}
                    reviews={0}
                    price={`₹${course.price?.toLocaleString()}`}
                    isBestseller={course.isBestseller}
                    imageColor={course.thumbnail ? undefined : "bg-blue-100"}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-gray-500">
                <p className="text-lg">No courses found.</p>
                <p className="text-sm mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
