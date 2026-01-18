'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAllEvents } from '@/lib/data';
import { filterEvents, getInitialFilterState, countActiveFilters } from '@/lib/filters';
import { FilterState } from '@/lib/types';
import EventList from '@/components/EventList';
import FilterPanel from '@/components/FilterPanel';
import MobileFilterDrawer from '@/components/MobileFilterDrawer';

export default function EventsPage() {
  const [filters, setFilters] = useState<FilterState>(getInitialFilterState());
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const allEvents = getAllEvents();
  const filteredEvents = filterEvents(allEvents, filters);
  const activeFilterCount = countActiveFilters(filters);

  const handleResetFilters = () => {
    setFilters(getInitialFilterState());
  };

  return (
    <div className="min-h-screen bg-[#fdfcfa]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#e5dccb]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-[#8a8578] hover:text-[#5a9470] transition-colors">
              Home
            </Link>
            <svg className="w-4 h-4 text-[#d4d0c8]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-[#3d3a35] font-medium">All Activities</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3d3a35]">All Activities</h1>
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
      </div>

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
