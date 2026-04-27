"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FeatureCard } from "@/components/cards/feature-card";
import { Target, Lightbulb, GraduationCap, Globe, Award, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="mb-6 text-4xl font-extrabold text-white sm:text-5xl">
              About NEDC
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-blue-100 leading-relaxed">
              The National Entrepreneurship Development Centre is a premium business
              education platform where users can subscribe, learn entrepreneurship,
              understand GST/legalization, become funding-ready, earn certificates,
              and access a modern dashboard.
            </p>
          </div>
        </section>

        {/* Mission / Vision */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold text-gray-900">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  To create a trusted national platform that helps Indians learn
                  business, become certified, and grow with confidence. We believe
                  every aspiring entrepreneur deserves access to world-class education
                  regardless of their background.
                </p>
              </div>
              <div>
                <h2 className="mb-6 text-3xl font-bold text-gray-900">Our Vision</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  To be India&#39;s most impactful entrepreneurship education platform,
                  nurturing the next generation of business leaders through practical,
                  industry-aligned curriculum and mentorship.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-3xl font-bold text-gray-900 text-center">What We Stand For</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard icon={Target} title="Practical Learning" description="Real-world projects and case studies, not just theory." iconColor="text-blue-500" iconBgColor="bg-blue-50" />
              <FeatureCard icon={Lightbulb} title="Innovation First" description="We stay ahead with the latest in business education and technology." iconColor="text-yellow-500" iconBgColor="bg-yellow-50" />
              <FeatureCard icon={GraduationCap} title="Certified Outcomes" description="Industry-recognized certificates upon course completion." iconColor="text-green-500" iconBgColor="bg-green-50" />
              <FeatureCard icon={Globe} title="Nationwide Reach" description="Accessible to learners across India, in multiple languages." iconColor="text-purple-500" iconBgColor="bg-purple-50" />
              <FeatureCard icon={Award} title="Expert Mentors" description="Learn from successful entrepreneurs and industry leaders." iconColor="text-orange-500" iconBgColor="bg-orange-50" />
              <FeatureCard icon={Users} title="Community Driven" description="Join a thriving community of 10,000+ aspiring entrepreneurs." iconColor="text-pink-500" iconBgColor="bg-pink-50" />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
              {[
                { label: "Learners", value: "10,000+" },
                { label: "Courses", value: "50+" },
                { label: "Certificates Issued", value: "5,000+" },
                { label: "Success Rate", value: "95%" },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                  <div className="text-4xl font-extrabold text-blue-600">{stat.value}</div>
                  <div className="mt-2 text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}