"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/cards/course-card";
import { FeatureCard } from "@/components/cards/feature-card";
import { ReviewCard } from "@/components/cards/review-card";
import {
  Monitor,
  Briefcase,
  MessageCircle,
  Calendar,
  Award,
  UploadCloud,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  BookOpen,
  Users,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface HomepageCourse {
  id: string;
  title: string;
  price: number;
  category?: string;
  duration?: string;
  isBestseller: boolean;
  isFeatured: boolean;
  thumbnail?: string;
  _count?: { enrollments: number; modules: number };
}

interface HomepageData {
  courses: HomepageCourse[];
  stats: {
    totalCourses: number;
    totalLearners: number;
  };
}

export default function Home() {
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/courses/homepage`)
      .then((r) => r.json())
      .then((d) => setHomepageData(d.data || d))
      .catch(() => {});
  }, []);

  const courses = homepageData?.courses || [];
  const totalLearners = homepageData?.stats?.totalLearners || 0;
  const totalCourses = homepageData?.stats?.totalCourses || 0;

  // Format learner count for display
  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k+`;
    return `${n}+`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />

      <main className="flex-1">
        {/* ═══ HERO ═══ */}
        <section className="relative overflow-hidden bg-white">
          <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                  </span>
                  India&apos;s #1 Entrepreneurship Platform
                </div>
                <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl xl:text-7xl leading-[1.1]">
                  Upgrade your skills for{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    better future
                  </span>
                </h1>
                <p className="mb-8 text-lg text-gray-600 sm:text-xl leading-relaxed max-w-lg">
                  Learn entrepreneurship, GST/legalization, become funding-ready, earn
                  certificates, and access a modern learning dashboard.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="px-8 shadow-blue-500/25 shadow-lg">
                      Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/courses">
                    <Button variant="outline" size="lg" className="px-8">
                      Explore Courses
                    </Button>
                  </Link>
                </div>
                <div className="mt-12 flex items-center gap-8 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span><strong className="text-gray-900">{totalLearners > 0 ? formatCount(totalLearners) : "10,000+"}</strong> Learners</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <span><strong className="text-gray-900">{totalCourses > 0 ? `${totalCourses}+` : "50+"}</strong> Courses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span><strong className="text-gray-900">95%</strong> Success</span>
                  </div>
                </div>
              </div>

              {/* Hero visual */}
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none flex justify-center">
                <div className="relative h-[500px] w-full max-w-[450px] rounded-t-full bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden border-8 border-white shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-indigo-100 mix-blend-multiply" />
                  <div className="absolute -right-4 top-1/4 h-24 w-24 rounded-full bg-yellow-400 opacity-80" />
                  <div className="absolute bottom-1/4 -left-4 h-32 w-32 rounded-full bg-blue-400 opacity-40" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center p-8">
                    <div className="text-6xl font-black text-blue-600/20">NEDC</div>
                  </div>
                </div>
                <div className="absolute -top-10 right-0 hidden md:block">
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="h-3 w-3 rounded-full bg-blue-500" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ RECOMMENDATION COURSES (Dynamic) ═══ */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                  Recommendation course for you
                </h2>
                <p className="text-gray-600">Curated picks to kickstart your entrepreneurship journey</p>
              </div>
              <Link href="/courses">
                <Button variant="primary">All Courses</Button>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {courses.length > 0 ? (
                <>
                  {courses.slice(0, 3).map((course) => (
                    <Link href={`/courses/${course.id}`} key={course.id}>
                      <CourseCard
                        title={course.title}
                        rating={4.8}
                        reviews={course._count?.enrollments || 0}
                        price={`₹${course.price.toLocaleString()}`}
                        isBestseller={course.isBestseller}
                        duration={course.duration || undefined}
                        lessons={course._count?.modules || 12}
                        imageColor={
                          ["bg-slate-200", "bg-blue-200", "bg-teal-200", "bg-indigo-100"][
                            courses.indexOf(course) % 4
                          ]
                        }
                      />
                    </Link>
                  ))}
                  <div className="flex items-center justify-center">
                    <Link href="/courses">
                      <button className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white hover:bg-blue-600 transition-colors shadow-lg">
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {/* Skeleton loading cards */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-80 animate-pulse rounded-2xl bg-gray-200" />
                  ))}
                  <div className="flex items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-gray-200 animate-pulse" />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ═══ WHY NEDC ═══ */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="mb-16 text-3xl font-bold text-gray-900 text-center md:text-left">
              Why NEDC?
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Monitor}
                title="Learn anything, anywhere"
                description="Access courses on entrepreneurship, GST, legalization, and business skills from any device."
                iconColor="text-blue-500"
                iconBgColor="bg-blue-50"
              />
              <FeatureCard
                icon={Briefcase}
                title="Real Case Studies"
                description="Work on projects built from real-world business scenarios to build your portfolio."
                iconColor="text-purple-500"
                iconBgColor="bg-purple-50"
              />
              <FeatureCard
                icon={MessageCircle}
                title="Mentor Support 24/7"
                description="Get help from industry mentors whenever you need guidance on your learning journey."
                iconColor="text-green-500"
                iconBgColor="bg-green-50"
              />
              <FeatureCard
                icon={Calendar}
                title="Flexible Scheduling"
                description="Choose a learning schedule that fits your lifestyle and pace."
                iconColor="text-orange-500"
                iconBgColor="bg-orange-50"
              />
              <FeatureCard
                icon={Award}
                title="Earn Certificates"
                description="Complete courses and earn recognized certificates to boost your credentials."
                iconColor="text-indigo-500"
                iconBgColor="bg-indigo-50"
              />
              <FeatureCard
                icon={UploadCloud}
                title="Build Your Portfolio"
                description="Showcase your work and completed projects to potential investors and partners."
                iconColor="text-pink-500"
                iconBgColor="bg-pink-50"
              />
            </div>
          </div>
        </section>

        {/* ═══ TOP COURSES (Dynamic) ═══ */}
        <section className="bg-gray-50 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-3xl font-bold text-gray-900">Discover Top Courses</h2>

            <div className="mb-10 flex overflow-x-auto pb-4 border-b border-gray-200">
              <div className="flex gap-8 whitespace-nowrap">
                <button className="border-b-2 border-blue-600 pb-4 font-semibold text-blue-600">All Categories</button>
                <button className="pb-4 font-medium text-gray-500 hover:text-gray-900">Entrepreneurship</button>
                <button className="pb-4 font-medium text-gray-500 hover:text-gray-900">GST &amp; Legal</button>
                <button className="pb-4 font-medium text-gray-500 hover:text-gray-900">Marketing</button>
                <button className="pb-4 font-medium text-gray-500 hover:text-gray-900">Finance</button>
                <button className="pb-4 font-medium text-gray-500 hover:text-gray-900">Leadership</button>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {courses.length > 0 ? (
                courses.slice(0, 4).map((course, idx) => (
                  <Link href={`/courses/${course.id}`} key={course.id}>
                    <CourseCard
                      title={course.title}
                      rating={4.6 + (idx % 3) * 0.1}
                      reviews={course._count?.enrollments || 0}
                      price={`₹${course.price.toLocaleString()}`}
                      isBestseller={course.isBestseller}
                      duration={course.duration || undefined}
                      lessons={course._count?.modules || 12}
                      imageColor={
                        ["bg-indigo-100", "bg-pink-100", "bg-yellow-100", "bg-emerald-100"][idx % 4]
                      }
                    />
                  </Link>
                ))
              ) : (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-80 animate-pulse rounded-2xl bg-gray-200" />
                ))
              )}
            </div>

            <div className="mt-12 flex items-center justify-center gap-4">
              <button className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <Link href="/courses">
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white hover:bg-blue-600 transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ CTA BLOCKS ═══ */}
        <section className="py-12 border-y border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-3xl bg-gray-50 p-8 md:p-12 hover:shadow-lg transition-shadow">
                <div>
                  <p className="text-sm font-semibold text-blue-600 mb-2">Browse Courses</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 max-w-xs">
                    Looking for your next course? Find the perfect fit here
                  </h3>
                  <Link href="/courses">
                    <Button variant="outline" className="rounded-full bg-white">
                      Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-gray-50 p-8 md:p-12 hover:shadow-lg transition-shadow">
                <div>
                  <p className="text-sm font-semibold text-blue-600 mb-2">Gallery</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 max-w-xs">
                    Explore our events, workshops, and student achievements
                  </h3>
                  <Link href="/gallery">
                    <Button variant="outline" className="rounded-full bg-white">
                      View Gallery <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CAREER ROADMAP ═══ */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="mb-2 text-3xl font-bold text-gray-900">Discover Roadmap for Career</h2>
              <p className="text-gray-600">Choose your path and start building</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                "Startup Founder",
                "Business Consultant",
                "Digital Marketer",
                "Financial Advisor",
                "Product Manager",
                "E-commerce Specialist",
              ].map((role, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-all hover:border-blue-500 hover:text-blue-600 hover:shadow-sm"
                >
                  {role}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
              <button className="flex items-center gap-2 rounded-full border border-transparent bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
                GST Expert
                <ChevronRight className="h-4 w-4" />
              </button>
              {[
                "Operations Manager",
                "HR Specialist",
                "Legal Compliance",
                "Sales Leader",
                "View More",
              ].map((role, i) => (
                <button
                  key={`more-${i}`}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-all hover:border-blue-500 hover:text-blue-600 hover:shadow-sm"
                >
                  {role}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ REVIEWS (static — no Review model yet) ═══ */}
        <section className="bg-gray-50 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="mb-16 text-3xl font-bold text-gray-900 text-center">
              Explore Member Reviews
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
              <ReviewCard
                name="Raj Patel"
                role="GST Registration & Compliance"
                review="This course helped me understand the entire GST process for my startup. The step-by-step modules were incredibly clear. I was able to register my business within a week of completing the course."
                rating={5}
              />
              <ReviewCard
                name="Priya Sharma"
                role="Business Plan Writing Masterclass"
                review="The mentor is excellent. Every concept was explained with real-world examples. I successfully pitched to 3 investors after completing this course!"
                rating={5}
              />
              <ReviewCard
                name="Arjun Mehta"
                role="Startup Fundraising"
                review="I love the practical approach. The mock pitch sessions and investor feedback were invaluable. Highly recommended for any aspiring entrepreneur."
                rating={5}
              />
            </div>
            <div className="flex justify-center">
              <Button variant="outline" className="rounded-full bg-white px-8">
                View More Reviews
              </Button>
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/20 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white/20 translate-x-1/3 translate-y-1/3" />
              </div>
              <div className="relative z-10 grid gap-8 lg:grid-cols-2 items-center p-12 md:p-20">
                <div>
                  <h2 className="mb-8 text-4xl font-bold text-white sm:text-5xl leading-tight">
                    Join over <span className="text-yellow-400">{totalLearners > 0 ? formatCount(totalLearners) : "10,000"}</span>
                    <br />
                    learners nationwide
                  </h2>
                  <p className="mb-8 text-blue-100 text-lg max-w-md">
                    Start your entrepreneurship journey today and become part of India&apos;s fastest growing
                    business education community.
                  </p>
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-6 text-lg rounded-full shadow-xl"
                    >
                      Register Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
                <div className="hidden lg:flex items-center justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-black text-white">NEDC</div>
                        <div className="text-blue-200 mt-2 text-sm">Building India&apos;s Entrepreneurs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
