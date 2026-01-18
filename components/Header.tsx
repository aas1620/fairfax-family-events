'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#1e3a5f] sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              {/* Logo mark */}
              <div className="w-9 h-9 rounded-xl bg-[#5a9470] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-white tracking-tight leading-tight">
                  Fairfax Family
                </span>
                <span className="text-xs text-[#7ab592] font-medium tracking-wider uppercase">
                  Weekend Adventures
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <Link
              href="/"
              className="text-[#d4c4a8] hover:text-white transition-colors text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/events"
              className="text-[#d4c4a8] hover:text-white transition-colors text-sm font-medium"
            >
              Explore
            </Link>
            <Link
              href="/about"
              className="text-[#d4c4a8] hover:text-white transition-colors text-sm font-medium"
            >
              About
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-[#d4c4a8] hover:text-white hover:bg-[#264a73] transition-colors"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#264a73]">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-[#d4c4a8] hover:text-white transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/events"
                className="text-[#d4c4a8] hover:text-white transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                href="/about"
                className="text-[#d4c4a8] hover:text-white transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
