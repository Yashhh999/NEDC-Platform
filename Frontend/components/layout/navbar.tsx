"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Search, Menu, X, Sun, Moon } from "lucide-react";

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              N
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              NEDC
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-8">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/courses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Courses
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/gallery" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Gallery
            </Link>
            <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden xl:flex relative items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              className="h-10 w-56 rounded-full border border-border bg-muted pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === "light" ? (
              <Moon className="h-[18px] w-[18px]" />
            ) : (
              <Sun className="h-[18px] w-[18px]" />
            )}
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-4">
              {isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <button onClick={logout} className="text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/login" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                Sign in
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card px-4 py-6 space-y-4">
          <Link href="/" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href="/about" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>About</Link>
          <Link href="/courses" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Courses</Link>
          <Link href="/pricing" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link href="/gallery" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Gallery</Link>
          <Link href="/blog" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Blog</Link>
          <Link href="/contact" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Contact</Link>
          <hr className="border-border" />
          {user ? (
            <>
              <Link href="/dashboard" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm font-medium text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm font-semibold text-foreground" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
