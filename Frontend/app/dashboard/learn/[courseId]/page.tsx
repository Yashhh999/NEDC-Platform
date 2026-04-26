"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Circle,
  Play,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface Lesson {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  duration?: string;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description?: string;
  modules: Module[];
}

export default function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { token } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch course data
  useEffect(() => {
    if (!courseId) return;
    fetch(`${API_BASE}/courses/${courseId}`)
      .then((r) => r.json())
      .then((d) => {
        const data = d.data || d;
        setCourse(data);
        // Auto-expand all modules and select first lesson
        if (data.modules?.length > 0) {
          setExpandedModules(new Set(data.modules.map((m: Module) => m.id)));
          const firstLesson = data.modules[0]?.lessons?.[0];
          if (firstLesson) setActiveLesson(firstLesson);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  // Fetch progress
  useEffect(() => {
    if (!token || !courseId) return;
    fetch(`${API_BASE}/progress/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const data = d.data || d;
        setProgress(data);
      })
      .catch(() => {});

    // Fetch individual lesson completion
    fetch(`${API_BASE}/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(() => {
        // Progress endpoint returns course-level, for lesson-level we track locally
      })
      .catch(() => {});
  }, [token, courseId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const markComplete = async (lessonId: string) => {
    if (!token) return;
    await fetch(`${API_BASE}/progress/lesson/${lessonId}/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setCompletedLessons((prev) => new Set(prev).add(lessonId));
    // Refresh progress
    const res = await fetch(`${API_BASE}/progress/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    setProgress(d.data || d);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Course not found</p>
        <Link href="/dashboard/courses">
          <Button variant="outline">← Back to courses</Button>
        </Link>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — Course outline */}
      <aside className="fixed left-0 top-0 z-30 h-screen w-80 overflow-y-auto border-r border-gray-200 bg-white">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4">
          <Link
            href="/dashboard/courses"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h2 className="font-bold text-gray-900 line-clamp-2 text-lg">{course.title}</h2>
          {progress && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{progress.completedLessons || 0} / {totalLessons} lessons</span>
                <span className="font-semibold text-blue-600">{progress.percentage || 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${progress.percentage || 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-2">
          {course.modules
            .sort((a, b) => a.order - b.order)
            .map((module) => (
              <div key={module.id} className="mb-1">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  {expandedModules.has(module.id) ? (
                    <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                  )}
                  <span className="flex-1 line-clamp-2">{module.title}</span>
                  <span className="text-xs text-gray-400">{module.lessons.length}</span>
                </button>
                {expandedModules.has(module.id) && (
                  <ul className="ml-4 space-y-0.5 pb-2">
                    {module.lessons
                      .sort((a, b) => a.order - b.order)
                      .map((lesson) => {
                        const isActive = activeLesson?.id === lesson.id;
                        const isCompleted = completedLessons.has(lesson.id);
                        return (
                          <li key={lesson.id}>
                            <button
                              onClick={() => setActiveLesson(lesson)}
                              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                isActive
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-300 shrink-0" />
                              )}
                              <span className="flex-1 line-clamp-1">{lesson.title}</span>
                              {lesson.duration && (
                                <span className="text-xs text-gray-400">{lesson.duration}</span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>
            ))}
        </div>
      </aside>

      {/* Main content area */}
      <main className="ml-80 flex-1 p-8">
        {activeLesson ? (
          <div className="max-w-4xl mx-auto">
            {/* Video player area */}
            {activeLesson.videoUrl ? (
              <div className="mb-8 aspect-video w-full overflow-hidden rounded-2xl bg-black">
                <iframe
                  src={activeLesson.videoUrl}
                  className="h-full w-full"
                  allowFullScreen
                  title={activeLesson.title}
                />
              </div>
            ) : (
              <div className="mb-8 flex aspect-video w-full items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100">
                <div className="text-center">
                  <Play className="mx-auto mb-3 h-16 w-16 text-blue-300" />
                  <p className="text-gray-500">No video for this lesson</p>
                </div>
              </div>
            )}

            {/* Lesson info */}
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{activeLesson.title}</h1>
                {activeLesson.duration && (
                  <p className="text-sm text-gray-500">Duration: {activeLesson.duration}</p>
                )}
              </div>
              <Button
                onClick={() => markComplete(activeLesson.id)}
                disabled={completedLessons.has(activeLesson.id)}
                variant={completedLessons.has(activeLesson.id) ? "outline" : "primary"}
              >
                {completedLessons.has(activeLesson.id) ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Completed
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Complete
                  </>
                )}
              </Button>
            </div>

            {/* Lesson content */}
            {activeLesson.content && (
              <Card className="p-8">
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {activeLesson.content}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a lesson</h2>
            <p className="text-gray-500">Choose a lesson from the sidebar to start learning.</p>
          </div>
        )}
      </main>
    </div>
  );
}
