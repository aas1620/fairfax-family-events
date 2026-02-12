'use client';

export default function HeroSection() {
  return (
    <section className="py-16 lg:py-24 bg-[#fdfcfa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Copy */}
          <div className="max-w-xl">
            {/* Eyebrow */}
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#5a9470]/10 text-[#5a9470]
                           rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-[#5a9470] rounded-full animate-pulse"></span>
              113 activities this weekend
            </span>

            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#1e3a5f] mt-6 leading-tight">
              Finally, weekend plans that don&apos;t require a PhD.
            </h1>

            {/* Subhead */}
            <p className="text-lg lg:text-xl text-[#8a8578] mt-6 leading-relaxed">
              Find parks, museums, and family events in Fairfax County—filtered by your kids&apos; ages,
              your budget, and how much energy you have left.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <a href="#activities"
                 className="px-8 py-4 bg-[#1e3a5f] text-white rounded-xl font-semibold text-center
                          hover:bg-[#2a4a73] transition-colors shadow-lg shadow-[#1e3a5f]/20">
                Find This Weekend&apos;s Activities
              </a>
              <a href="#how-it-works"
                 className="px-8 py-4 text-[#1e3a5f] font-semibold text-center
                          hover:text-[#5a9470] transition-colors flex items-center justify-center gap-2">
                How It Works
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </a>
            </div>

            {/* Quick trust signal */}
            <p className="text-sm text-[#8a8578] mt-6">
              <span className="font-medium text-[#5a9470]">Free to use</span> · Updated weekly ·
              Curated by local parents
            </p>
          </div>

          {/* Right: Activity preview cards (stacked/overlapping) */}
          <div className="relative hidden lg:block">
            {/* Decorative background blob */}
            <div className="absolute -inset-4 bg-[#5a9470]/5 rounded-[3rem] -rotate-3"></div>

            {/* Preview cards (staggered) */}
            <div className="relative space-y-4">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100
                            transform rotate-1 hover:rotate-0 transition-transform">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-[#5a9470]/10 rounded-xl flex items-center justify-center text-2xl">
                    🌿
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        FREE
                      </span>
                      <span className="text-xs text-[#8a8578]">Burke Lake Park</span>
                    </div>
                    <h3 className="font-semibold text-[#1e3a5f] mt-1">Nature Trail Scavenger Hunt</h3>
                    <p className="text-sm text-[#8a8578]">Ages 3-10 · Low energy</p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100
                            transform -rotate-1 ml-8 hover:rotate-0 transition-transform">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-[#d4c4a8]/30 rounded-xl flex items-center justify-center text-2xl">
                    🎨
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8a8578]">Children&apos;s Science Center</span>
                    </div>
                    <h3 className="font-semibold text-[#1e3a5f] mt-1">Weekend Art Workshop</h3>
                    <p className="text-sm text-[#8a8578]">Ages 5-12 · $15/child</p>
                  </div>
                </div>
              </div>

              {/* Card 3 (partial, faded) */}
              <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100
                            opacity-60 transform rotate-2 ml-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
                    📚
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1e3a5f]">Storytime at the Library</h3>
                    <p className="text-sm text-[#8a8578]">Ages 2-5 · Free</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
