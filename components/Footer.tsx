import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1e3a5f] mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#5a9470] flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
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
              <span className="font-semibold text-white">Fairfax Family</span>
            </div>
            <p className="text-[#8a8578] text-sm leading-relaxed">
              Helping families discover weekend adventures across Fairfax County
              and Northern Virginia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#d4c4a8] font-medium mb-4 text-sm uppercase tracking-wider">
              Explore
            </h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/"
                className="text-[#8a8578] hover:text-white transition-colors text-sm"
              >
                Home
              </Link>
              <Link
                href="/events"
                className="text-[#8a8578] hover:text-white transition-colors text-sm"
              >
                All Activities
              </Link>
              <Link
                href="/about"
                className="text-[#8a8578] hover:text-white transition-colors text-sm"
              >
                About Us
              </Link>
            </nav>
          </div>

          {/* Data Sources */}
          <div>
            <h3 className="text-[#d4c4a8] font-medium mb-4 text-sm uppercase tracking-wider">
              Our Sources
            </h3>
            <p className="text-[#8a8578] text-sm leading-relaxed">
              Data compiled from Fairfax County Parks, Smithsonian, local
              libraries, and venue websites.
            </p>
            <p className="text-[#5c5850] text-xs mt-3">
              Always confirm details with venues before visiting.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[#264a73]">
          <p className="text-xs text-[#5c5850] text-center">
            &copy; {new Date().getFullYear()} Fairfax Family. Not affiliated
            with Fairfax County government. Made with care for local families.
          </p>
        </div>
      </div>
    </footer>
  );
}
