import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Privacy Policy</h1>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
            <p><strong>Last updated:</strong> April 2026</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">1. Information We Collect</h2>
            <p>
              We collect information you provide directly: name, email address, phone number, and
              payment information. We also collect usage data such as courses accessed, progress,
              and device information.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">2. How We Use Your Information</h2>
            <p>
              Your information is used to provide and improve our services, process payments,
              send notifications, issue certificates, and communicate updates about the platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">3. Data Security</h2>
            <p>
              We employ industry-standard security measures including SSL encryption, bcrypt password
              hashing, and JWT-based authentication. Payment data is processed by PCI-DSS compliant
              payment processors (Razorpay).
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">4. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with trusted service providers
              (payment processors, email services) as necessary to operate the platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">5. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal data at any time through
              your dashboard settings. You may also contact us to request data export or account deletion.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">6. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. No third-party
              tracking cookies are used without your explicit consent.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10">7. Contact</h2>
            <p>
              For privacy-related concerns, contact us at{" "}
              <a href="mailto:privacy@nedc.in" className="text-blue-600 hover:underline">privacy@nedc.in</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
