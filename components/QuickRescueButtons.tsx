'use client';

import { FilterState } from '@/lib/types';
import { getInitialFilterState } from '@/lib/filters';

interface QuickRescueButtonsProps {
  onApplyFilter: (filters: FilterState) => void;
  activeRescue: string | null;
  setActiveRescue: (id: string | null) => void;
}

interface QuickRescue {
  id: string;
  icon: string;
  label: string;
  subtext: string;
  filters: Partial<FilterState>;
}

const QUICK_RESCUES: QuickRescue[] = [
  {
    id: 'rainy-day',
    icon: '☔',
    label: "It's Raining",
    subtext: 'Indoor activities',
    filters: {
      activityTypes: ['science', 'arts', 'history', 'educational', 'physical-play'],
    },
  },
  {
    id: 'free-stuff',
    icon: '💸',
    label: 'Broke Until Friday',
    subtext: 'Free stuff only',
    filters: {
      maxCost: 0,
    },
  },
  {
    id: 'burn-energy',
    icon: '⚡',
    label: 'Burn Energy',
    subtext: 'Physical play',
    filters: {
      activityTypes: ['physical-play', 'adventure'],
    },
  },
  {
    id: 'tiny-human',
    icon: '👶',
    label: 'Tiny Human',
    subtext: 'Ages 0-3',
    filters: {
      ageRange: { min: 0, max: 3 },
    },
  },
  {
    id: 'teen-approved',
    icon: '🙄',
    label: "Teen Won't Hate It",
    subtext: 'Ages 10+',
    filters: {
      ageRange: { min: 10, max: 99 },
    },
  },
];

export default function QuickRescueButtons({
  onApplyFilter,
  activeRescue,
  setActiveRescue,
}: QuickRescueButtonsProps) {
  const handleClick = (rescue: QuickRescue) => {
    if (activeRescue === rescue.id) {
      // Deselect - reset to initial filters
      setActiveRescue(null);
      onApplyFilter(getInitialFilterState());
    } else {
      // Select this rescue
      setActiveRescue(rescue.id);
      const newFilters: FilterState = {
        ...getInitialFilterState(),
        ...rescue.filters,
      };
      onApplyFilter(newFilters);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-[#8a8578] uppercase tracking-wider mb-4">
        Quick Rescue
      </h3>
      <div className="flex flex-wrap gap-3">
        {QUICK_RESCUES.map((rescue) => {
          const isActive = activeRescue === rescue.id;
          return (
            <button
              key={rescue.id}
              onClick={() => handleClick(rescue)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                isActive
                  ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white shadow-lg shadow-[#1e3a5f]/25'
                  : 'bg-white border-[#e5dccb] hover:border-[#c4a882] hover:shadow-md'
              }`}
            >
              <span className={`text-2xl ${isActive ? '' : 'group-hover:scale-110'} transition-transform`}>
                {rescue.icon}
              </span>
              <div className="text-left">
                <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-[#3d3a35]'}`}>
                  {rescue.label}
                </div>
                <div className={`text-xs ${isActive ? 'text-[#a8c4d4]' : 'text-[#8a8578]'}`}>
                  {rescue.subtext}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
