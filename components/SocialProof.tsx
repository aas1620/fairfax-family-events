'use client';

export default function SocialProof() {
  return (
    <>
      {/* Stats bar */}
      <section className="py-12 bg-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white">2,400+</p>
              <p className="text-[#d4c4a8] mt-1 text-sm">Local families exploring</p>
            </div>
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white">113</p>
              <p className="text-[#d4c4a8] mt-1 text-sm">Curated activities</p>
            </div>
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white">67%</p>
              <p className="text-[#d4c4a8] mt-1 text-sm">Free or low-cost</p>
            </div>
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white">Weekly</p>
              <p className="text-[#d4c4a8] mt-1 text-sm">Fresh updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-[#fdfcfa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1e3a5f]">
              What Fairfax parents are saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex gap-1 text-[#5a9470]">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>

              <blockquote className="text-[#1e3a5f] mt-4 leading-relaxed">
                &quot;Finally! I was so tired of Googling &apos;things to do with kids near me&apos; every Saturday morning.
                This saved my sanity.&quot;
              </blockquote>

              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 bg-[#5a9470]/20 rounded-full flex items-center justify-center
                              text-[#5a9470] font-semibold">
                  JM
                </div>
                <div>
                  <p className="font-semibold text-[#1e3a5f] text-sm">Jessica M.</p>
                  <p className="text-xs text-[#8a8578]">Mom of 2, Reston</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex gap-1 text-[#5a9470]">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>

              <blockquote className="text-[#1e3a5f] mt-4 leading-relaxed">
                &quot;The &apos;low energy&apos; filter is genius. Some days you just need activities
                that don&apos;t require you to be &apos;on&apos;. This gets it.&quot;
              </blockquote>

              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 bg-[#d4c4a8]/30 rounded-full flex items-center justify-center
                              text-[#8a8578] font-semibold">
                  DK
                </div>
                <div>
                  <p className="font-semibold text-[#1e3a5f] text-sm">David K.</p>
                  <p className="text-xs text-[#8a8578]">Dad of 3, Fairfax</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex gap-1 text-[#5a9470]">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>

              <blockquote className="text-[#1e3a5f] mt-4 leading-relaxed">
                &quot;I&apos;ve lived here 5 years and didn&apos;t know half these places existed.
                The kids are obsessed with checking &apos;what&apos;s new&apos; every week.&quot;
              </blockquote>

              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center
                              text-blue-600 font-semibold">
                  SP
                </div>
                <div>
                  <p className="font-semibold text-[#1e3a5f] text-sm">Sarah P.</p>
                  <p className="text-xs text-[#8a8578]">Mom of 1, Vienna</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
