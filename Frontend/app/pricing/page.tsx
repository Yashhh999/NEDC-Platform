import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Get started with the basics",
    features: ["2 Free Courses", "Community Access", "Basic Dashboard", "Email Support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    description: "For serious learners",
    features: [
      "All Courses Unlocked",
      "Certificates Included",
      "Priority Mentor Support",
      "Course Downloads",
      "Progress Tracking",
      "Portfolio Builder",
    ],
    cta: "Subscribe Now",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "₹1,999",
    period: "/month",
    description: "For teams & organizations",
    features: [
      "Everything in Pro",
      "Team Dashboard",
      "Custom Courses",
      "Dedicated Account Manager",
      "API Access",
      "Invoice & GST Billing",
      "White-label Option",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
                Simple, Transparent Pricing
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Choose the plan that fits your learning goals. Upgrade or cancel anytime.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`flex flex-col p-8 ${
                    plan.highlighted
                      ? "border-2 border-blue-600 shadow-xl scale-105 relative"
                      : ""
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-gray-600">{plan.description}</p>
                  <ul className="mt-8 space-y-4 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="mt-8">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "primary" : "outline"}
                    >
                      {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
