import React from "react";
import Link from "next/link";
import { Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1e1e24] text-white pt-20 pb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
                N
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                NEDC
              </span>
            </Link>
            <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
              National Entrepreneurship Development Centre — A premium business education platform
              helping Indians learn entrepreneurship, become certified, and grow with confidence.
            </p>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 rounded-full border border-gray-700 bg-transparent px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
                <Globe className="h-4 w-4" />
                English
              </button>
            </div>
          </div>

          {/* Links - About */}
          <div>
            <h4 className="text-lg font-semibold mb-6">NEDC</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
              <li><Link href="/courses" className="text-gray-400 hover:text-white transition-colors">Courses</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/gallery" className="text-gray-400 hover:text-white transition-colors">Gallery</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Links - Community */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Community</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Learners</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Partners</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Mentors</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          {/* Links - Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm font-semibold text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">Facebook</Link>
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
            <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} NEDC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
