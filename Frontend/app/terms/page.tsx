import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Terms of Service</h1>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
            <p><strong>Last updated:</strong> April 2026</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the National Entrepreneurship Development Centre (NEDC) platform,
              you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">2. Use of Services</h2>
            <p>
              NEDC provides online business education courses, resources, and certification programs.
              You must be at least 18 years old to create an account. You are responsible for maintaining
              the confidentiality of your account credentials.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">3. Course Access & Subscriptions</h2>
            <p>
              Access to courses is granted upon valid enrollment or active subscription. Course content
              is for personal, non-commercial use only. You may not share, redistribute, or resell any
              course materials.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">4. Payments & Refunds</h2>
            <p>
              All payments are processed securely through Razorpay. Refund requests must be submitted
              within 7 days of purchase. NEDC reserves the right to deny refund requests after content
              has been substantially accessed.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">5. Certificates</h2>
            <p>
              Certificates are issued upon successful completion of all course modules. NEDC certificates
              are for educational purposes and do not constitute professional licensure.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">6. Limitation of Liability</h2>
            <p>
              NEDC is not liable for any indirect, incidental, or consequential damages arising from
              the use of our platform. Our total liability shall not exceed the amount paid for the
              service in question.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">7. Contact</h2>
            <p>
              For questions about these Terms, please contact us at{" "}
              <a href="mailto:legal@nedc.in" className="text-blue-600 hover:underline">legal@nedc.in</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
