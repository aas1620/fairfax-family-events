'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAllEvents } from '@/lib/data';
import { filterEvents, getInitialFilterState, countActiveFilters } from '@/lib/filters';
import { FilterState } from '@/lib/types';
import EventList from '@/components/EventList';
import FilterPanel from '@/components/FilterPanel';
import MobileFilterDrawer from '@/components/MobileFilterDrawer';
import QuickRescueButtons from '@/components/QuickRescueButtons';

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>(getInitialFilterState());
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeRescue, setActiveRescue] = useState<string | null>(null);

  const allEvents = getAllEvents();
  const filteredEvents = filterEvents(allEvents, filters);
  const activeFilterCount = countActiveFilters(filters);

  const handleResetFilters = () => {
    setFilters(getInitialFilterState());
    setActiveRescue(null);
  };

  const handleQuickRescueFilter = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfa]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] via-[#264a73] to-[#2d5a87]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#5a9470] blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-[#c4a882] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-[#7ab592] font-medium tracking-wide uppercase text-sm mb-4">
              Fairfax County & Northern Virginia
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
              Weekend adventures
              <br />
              <span className="text-[#d4c4a8]">for the whole family</span>
            </h1>
            <p className="mt-6 text-lg text-[#a8c4d4] leading-relaxed max-w-xl">
              Discover parks, museums, farms, and family-friendly events across
              Fairfax County. From free outdoor fun to exciting indoor adventures.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/events"
                className="inline-flex items-center rounded-xl bg-[#5a9470] px-6 py-3.5 font-semibold text-white hover:bg-[#4a7d5e] transition-colors shadow-lg shadow-[#5a9470]/25"
              >
                Explore Activities
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-xl bg-white/10 backdrop-blur-sm px-6 py-3.5 font-semibold text-white hover:bg-white/20 transition-colors border border-white/20"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path
              d="M0 60V30C240 10 480 0 720 0s480 10 720 30v30H0z"
              fill="#fdfcfa"
            />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#3d3a35]">
              Discover Activities
            </h2>
            <p className="text-[#8a8578] mt-1">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'activity' : 'activities'}{' '}
              {activeFilterCount > 0 || activeRescue ? 'matching your filters' : 'to explore'}
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

        {/* Quick Rescue Buttons */}
        <QuickRescueButtons
          onApplyFilter={handleQuickRescueFilter}
          activeRescue={activeRescue}
          setActiveRescue={setActiveRescue}
        />

        {/* Desktop: Sidebar + Grid Layout */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Event Grid */}
          <div className="lg:col-span-3">
            <EventList events={filteredEvents} />
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        resultCount={filteredEvents.length}
      />
    </div>
  );
}
