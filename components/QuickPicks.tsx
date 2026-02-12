'use client';

import { FilterState } from '@/lib/types';
import { getInitialFilterState } from '@/lib/filters';

interface QuickPicksProps {
  activeQuickPick: string | null;
  onQuickPickChange: (pick: string | null, filters: FilterState) => void;
}

interface QuickPickOption {
  id: string;
  label: string;
  filters: Partial<FilterState>;
}

const QUICK_PICKS: QuickPickOption[] = [
  {
    id: 'free-weekend',
    label: 'Free This Weekend',
    filters: {
      maxCost: 0,
      datePreset: 'this-weekend',
    },
  },
  {
    id: 'rainy-indoor',
    label: 'Rainy Day Indoor',
    filters: {
      activityTypes: ['arts', 'science', 'educational', 'history', 'music'],
    },
  },
  {
    id: 'under-5',
    label: 'Under 5 Friendly',
    filters: {
      ageRange: { min: 0, max: 5 },
    },
  },
  {
    id: 'low-energy',
    label: "Low Energy (You're Tired)",
    filters: {
      // We'll filter by events with exhaustionRating 1-2
      // For now, we'll use arts/educational as proxy for calmer activities
      activityTypes: ['arts', 'educational', 'history'],
    },
  },
];

export default function QuickPicks({ activeQuickPick, onQuickPickChange }: QuickPicksProps) {
  const handleQuickPickClick = (pick: QuickPickOption) => {
    if (activeQuickPick === pick.id) {
      // Deselect - reset to initial filters
      onQuickPickChange(null, getInitialFilterState());
    } else {
      // Apply this quick pick's filters
      const newFilters: FilterState = {
        ...getInitialFilterState(),
        ...pick.filters,
      };
      onQuickPickChange(pick.id, newFilters);
    }
  };

  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-[#8a8578] mb-3">Quick picks:</p>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
        {QUICK_PICKS.map((pick) => {
          const isActive = activeQuickPick === pick.id;
          return (
            <button
              key={pick.id}
              onClick={() => handleQuickPickClick(pick)}
              className={`flex-shrink-0 px-4 py-2 border-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#5a9470] border-[#5a9470] text-white'
                  : 'bg-white border-gray-200 text-[#1e3a5f] hover:border-[#5a9470] hover:text-[#5a9470]'
              }`}
            >
              {pick.label}
              {isActive && (
                <svg className="w-4 h-4 ml-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
