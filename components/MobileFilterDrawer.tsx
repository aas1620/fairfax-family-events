'use client';

import { FilterState } from '@/lib/types';
import FilterPanel from './FilterPanel';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  resultCount: number;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  resultCount,
}: MobileFilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 bg-[#fdfcfa] rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5dccb]">
          <h2 className="font-semibold text-[#3d3a35] text-lg">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[#8a8578] hover:text-[#5c5850] rounded-lg hover:bg-[#f7f4ee] transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        {/* Filter content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <FilterPanel
            filters={filters}
            onFilterChange={onFilterChange}
            onReset={onReset}
            className="shadow-none border-none p-0 bg-transparent"
          />
        </div>

        {/* Footer */}
        <div className="border-t border-[#e5dccb] p-4 bg-white">
          <button
            onClick={onClose}
            className="w-full bg-[#5a9470] text-white py-3.5 rounded-xl font-semibold hover:bg-[#4a7d5e] transition-colors shadow-lg shadow-[#5a9470]/25"
          >
            Show {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </button>
        </div>
      </div>
    </div>
  );
}
