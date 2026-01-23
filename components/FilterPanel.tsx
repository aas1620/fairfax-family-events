'use client';

import {
  ActivityType,
  ACTIVITY_LABELS,
  AGE_PRESETS,
  COST_PRESETS,
  CITIES,
  DATE_PRESETS,
  SORT_OPTIONS,
  EVENT_TYPE_PRESETS,
  FilterState,
  DatePreset,
  SortOption,
  EventTypeFilter,
} from '@/lib/types';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  className?: string;
}

export default function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  className = '',
}: FilterPanelProps) {
  const handleActivityToggle = (activity: ActivityType) => {
    const newActivities = filters.activityTypes.includes(activity)
      ? filters.activityTypes.filter((a) => a !== activity)
      : [...filters.activityTypes, activity];
    onFilterChange({ ...filters, activityTypes: newActivities });
  };

  const handleCityToggle = (city: string) => {
    const newCities = filters.cities.includes(city)
      ? filters.cities.filter((c) => c !== city)
      : [...filters.cities, city];
    onFilterChange({ ...filters, cities: newCities });
  };

  const handleCostChange = (maxCost: number | null) => {
    onFilterChange({ ...filters, maxCost });
  };

  const handleAgeChange = (ageRange: { min: number; max: number } | null) => {
    onFilterChange({ ...filters, ageRange });
  };

  const handleDateChange = (datePreset: DatePreset) => {
    onFilterChange({ ...filters, datePreset });
  };

  const handleSortChange = (sortBy: SortOption) => {
    onFilterChange({ ...filters, sortBy });
  };

  const handleEventTypeChange = (eventType: EventTypeFilter) => {
    onFilterChange({ ...filters, eventType });
  };

  const hasActiveFilters =
    filters.activityTypes.length > 0 ||
    filters.cities.length > 0 ||
    filters.maxCost !== null ||
    filters.ageRange !== null ||
    filters.datePreset !== 'any' ||
    filters.eventType !== 'all';

  return (
    <div className={`bg-white rounded-2xl border border-[#e5dccb] flex flex-col max-h-[calc(100vh-8rem)] ${className}`}>
      <div className="flex items-center justify-between p-5 pb-0 mb-5 flex-shrink-0">
        <h2 className="font-semibold text-[#3d3a35] text-lg">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-[#5a9470] hover:text-[#3d6b4f] font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 px-5 pb-5 custom-scrollbar">
      {/* Sort By */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-[#8a8578] uppercase tracking-wider mb-2.5">
          Sort By
        </h3>
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="w-full px-3.5 py-2.5 border border-[#e5dccb] rounded-xl text-sm text-[#3d3a35] bg-[#fbfaf7] focus:outline-none focus:ring-2 focus:ring-[#5a9470]/30 focus:border-[#5a9470] transition-all"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Event Type Filter */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-[#8a8578] uppercase tracking-wider mb-2.5">
          Availability
        </h3>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handleEventTypeChange(preset.value)}
              className={`text-sm px-3.5 py-2 rounded-xl transition-all font-medium ${
                filters.eventType === preset.value
                  ? 'bg-[#c4a882] text-white shadow-sm'
                  : 'bg-[#f7f4ee] text-[#5c5850] hover:bg-[#f0ebe0]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-[#8a8578] uppercase tracking-wider mb-2.5">
          When
        </h3>
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handleDateChange(preset.value)}
              className={`text-sm px-3.5 py-2 rounded-xl transition-all font-medium ${
                filters.datePreset === preset.value
                  ? 'bg-[#1e3a5f] text-white shadow-sm'
                  : 'bg-[#f7f4ee] text-[#5c5850] hover:bg-[#f0ebe0]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Age Range */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-[#8a8578] uppercase tracking-wider mb-2.5">
          Age Group
        </h3>
        <div className="flex flex-wrap gap-2">
          {AGE_PRESETS.map((preset) => {
            const isSelected =
              filters.ageRange?.min === preset.min &&
              filters.ageRange?.max === preset.max;
            return (
              <button
                key={preset.label}
                onClick={() =>
                  handleAgeChange(
                    isSelected ? null : { min: preset.min, max: preset.max }
                  )
                }
                className={`text-sm px-3.5 py-2 rounded-xl transition-all font-medium ${
                  isSelected
                    ? 'bg-[#6b5344] text-white shadow-sm'
                    : 'bg-[#f7f4ee] text-[#5c5850] hover:bg-[#f0ebe0]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Types */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-[#8a8578] uppercase tracking-wider mb-2.5">
          Activity Type
        </h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((activity) => (
            <button
              key={activity}
              onClick={() => handleActivityToggle(activity)}
              className={`text-sm px-3.5 py-2 rounded-xl transition-all font-medium ${
                filters.activityTypes.includes(activity)
                  ? 'bg-[#5a9470] text-white shadow-sm'
                  : 'bg-[#f7f4ee] text-[#5c5850] hover:bg-[#f0ebe0]'
              }`}
            >
              {ACTIVITY_LABELS[activity]}
            </button>
          ))}
        </div>
      </div>

      {/* Cost */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-[#8a8578] uppercase tracking-wider mb-2.5">
          Cost
        </h3>
        <div className="flex flex-wrap gap-2">
          {COST_PRESETS.map((preset) => {
            const isSelected = filters.maxCost === preset.maxAmount;
            return (
              <button
                key={preset.label}
                onClick={() =>
                  handleCostChange(isSelected ? null : preset.maxAmount)
                }
                className={`text-sm px-3.5 py-2 rounded-xl transition-all font-medium ${
                  isSelected
                    ? 'bg-[#5a9470] text-white shadow-sm'
                    : 'bg-[#f7f4ee] text-[#5c5850] hover:bg-[#f0ebe0]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-xs font-semibold text-[#8a8578] uppercase tracking-wider mb-2.5">
          Location
        </h3>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => handleCityToggle(city)}
              className={`text-sm px-3.5 py-2 rounded-xl transition-all font-medium ${
                filters.cities.includes(city)
                  ? 'bg-[#1e3a5f] text-white shadow-sm'
                  : 'bg-[#f7f4ee] text-[#5c5850] hover:bg-[#f0ebe0]'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
