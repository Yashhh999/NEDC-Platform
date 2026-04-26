"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { fetcher } from "@/lib/api/fetcher";
import { BookOpen } from "lucide-react";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher<any>("/progress")
      .then((d) => setCourses(d.data || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">My Courses</h1>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((item: any, i: number) => (
            <Card key={i} className="overflow-hidden">
              <div className={`h-32 bg-gradient-to-br from-blue-100 to-indigo-100`} />
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.course?.title || "Course"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {item.category || "Entrepreneurship"}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-blue-600">{item.percentage || 0}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${item.percentage || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {item.completedLessons || 0} / {item.totalLessons || 0} lessons
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-4">Start learning by enrolling in a course.</p>
          <a href="/courses" className="text-blue-600 font-medium hover:underline">
            Browse Courses →
          </a>
        </Card>
      )}
    </div>
  );
}
