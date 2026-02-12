'use client';

import { useState } from 'react';
import { getAllEvents } from '@/lib/data';
import { filterEvents, getInitialFilterState, countActiveFilters } from '@/lib/filters';
import { FilterState } from '@/lib/types';
import EventList from '@/components/EventList';
import FilterPanel from '@/components/FilterPanel';
import MobileFilterDrawer from '@/components/MobileFilterDrawer';
import HeroSection from '@/components/HeroSection';
import SocialProof from '@/components/SocialProof';
import QuickPicks from '@/components/QuickPicks';

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>(getInitialFilterState());
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeQuickPick, setActiveQuickPick] = useState<string | null>(null);

  const allEvents = getAllEvents();
  const filteredEvents = filterEvents(allEvents, filters);
  const activeFilterCount = countActiveFilters(filters);

  const handleResetFilters = () => {
    setFilters(getInitialFilterState());
    setActiveQuickPick(null);
  };

  const handleQuickPickChange = (pick: string | null, newFilters: FilterState) => {
    setActiveQuickPick(pick);
    setFilters(newFilters);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Clear quick pick when user manually changes filters
    setActiveQuickPick(null);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfa]">
      {/* Hero Section */}
      <HeroSection />

      {/* Social Proof (Stats + Testimonials) */}
      <SocialProof />

      {/* Main Content */}
      <section id="activities" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#3d3a35]">
              Discover Activities
            </h2>
            <p className="text-[#8a8578] mt-1">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'activity' : 'activities'}{' '}
              {activeFilterCount > 0 ? 'matching your filters' : 'to explore'}
            </p>
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#5c5850] shadow-sm border border-[#e5dccb] hover:bg-[#f7f4ee] transition-colors"
          >
            <svg
              className="h-5 w-5 text-[#8a8578]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
              />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-[#5a9470] text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Picks */}
        <QuickPicks
          activeQuickPick={activeQuickPick}
          onQuickPickChange={handleQuickPickChange}
        />

        {/* Desktop: Sidebar + Grid Layout */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Event Grid */}
          <div className="lg:col-span-3">
            {filteredEvents.length > 0 ? (
              <EventList events={filteredEvents} />
            ) : (
              /* Empty state */
              <div className="text-center py-16 bg-white rounded-2xl border border-[#e5dccb]">
                <div className="w-20 h-20 bg-[#f7f4ee] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-[#8a8578]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#3d3a35] mb-2">
                  No activities match your filters
                </h3>
                <p className="text-[#8a8578] max-w-md mx-auto mb-6">
                  Try adjusting your filters or clearing them to see all available activities.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#5a9470] text-white font-medium rounded-xl hover:bg-[#4a7d5e] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-[#f7f4ee]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#1e3a5f] text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#5a9470]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#5a9470]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1e3a5f] text-lg mb-2">Filter by what matters</h3>
              <p className="text-[#8a8578]">
                Age, cost, energy level, and location. Find activities that fit your family.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#5a9470]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#5a9470]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1e3a5f] text-lg mb-2">Save your favorites</h3>
              <p className="text-[#8a8578]">
                Tap the heart to save activities for later. No account needed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#5a9470]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#5a9470]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1e3a5f] text-lg mb-2">Enjoy your weekend</h3>
              <p className="text-[#8a8578]">
                Spend less time planning, more time making memories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        resultCount={filteredEvents.length}
      />
    </div>
  );
}
