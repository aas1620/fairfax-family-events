import { Event, FilterState, DatePreset, SortOption } from './types';

function getDateRangeForPreset(preset: DatePreset): { start: Date; end: Date } | null {
  if (preset === 'any') return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'this-weekend': {
      // Find this Saturday and Sunday
      const dayOfWeek = today.getDay();
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + (dayOfWeek === 0 ? -1 : dayOfWeek === 6 ? 0 : daysUntilSaturday));
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      sunday.setHours(23, 59, 59, 999);
      return { start: saturday, end: sunday };
    }
    case 'this-week': {
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);
      return { start: today, end: endOfWeek };
    }
    case 'this-month': {
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      return { start: today, end: endOfMonth };
    }
    case 'next-month': {
      const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      endOfNextMonth.setHours(23, 59, 59, 999);
      return { start: startOfNextMonth, end: endOfNextMonth };
    }
    default:
      return null;
  }
}

function eventMatchesDateRange(
  event: Event,
  dateRange: { start: Date; end: Date }
): boolean {
  // Recurring events always match (they're always available)
  if (event.type === 'recurring') return true;

  // One-time events must fall within the date range
  if (event.startDate) {
    const eventStart = new Date(event.startDate);
    const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;

    // Event matches if it overlaps with the date range
    return eventStart <= dateRange.end && eventEnd >= dateRange.start;
  }

  return true;
}

export function filterEvents(events: Event[], filters: FilterState): Event[] {
  const dateRange = getDateRangeForPreset(filters.datePreset);

  const filtered = events.filter((event) => {
    // Activity type filter
    if (filters.activityTypes.length > 0) {
      const hasMatchingActivity = filters.activityTypes.some((activity) =>
        event.activityTypes.includes(activity)
      );
      if (!hasMatchingActivity) return false;
    }

    // City filter
    if (filters.cities.length > 0) {
      if (!filters.cities.includes(event.city)) return false;
    }

    // Cost filter
    if (filters.maxCost !== null) {
      if (filters.maxCost === 0) {
        // Free only
        if (event.cost.per !== 'free' && event.cost.amount > 0) return false;
      } else {
        // Under X amount (also include free)
        if (event.cost.per !== 'free' && event.cost.amount > filters.maxCost)
          return false;
      }
    }

    // Age filter
    if (filters.ageRange !== null) {
      const eventMin = event.ageRange.min;
      const eventMax = event.ageRange.max;
      const filterMin = filters.ageRange.min;
      const filterMax = filters.ageRange.max;

      const hasOverlap = eventMin <= filterMax && eventMax >= filterMin;
      if (!hasOverlap) return false;
    }

    // Date filter
    if (dateRange !== null) {
      if (!eventMatchesDateRange(event, dateRange)) return false;
    }

    return true;
  });

  // Sort the results
  return sortEvents(filtered, filters.sortBy);
}

export function sortEvents(events: Event[], sortBy: SortOption): Event[] {
  const sorted = [...events];

  switch (sortBy) {
    case 'date-asc':
      return sorted.sort((a, b) => {
        // One-time events with dates come first, sorted by date
        // Recurring events come after, sorted by name
        const aDate = a.startDate ? new Date(a.startDate).getTime() : Infinity;
        const bDate = b.startDate ? new Date(b.startDate).getTime() : Infinity;
        if (aDate !== bDate) return aDate - bDate;
        return a.title.localeCompare(b.title);
      });
    case 'date-desc':
      return sorted.sort((a, b) => {
        const aDate = a.startDate ? new Date(a.startDate).getTime() : -Infinity;
        const bDate = b.startDate ? new Date(b.startDate).getTime() : -Infinity;
        if (aDate !== bDate) return bDate - aDate;
        return a.title.localeCompare(b.title);
      });
    case 'name':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'cost':
      return sorted.sort((a, b) => {
        const aCost = a.cost.per === 'free' ? 0 : a.cost.amount;
        const bCost = b.cost.per === 'free' ? 0 : b.cost.amount;
        if (aCost !== bCost) return aCost - bCost;
        return a.title.localeCompare(b.title);
      });
    default:
      return sorted;
  }
}

export function getInitialFilterState(): FilterState {
  return {
    activityTypes: [],
    cities: [],
    maxCost: null,
    ageRange: null,
    datePreset: 'any',
    sortBy: 'date-asc',
  };
}

export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.activityTypes.length > 0) count++;
  if (filters.cities.length > 0) count++;
  if (filters.maxCost !== null) count++;
  if (filters.ageRange !== null) count++;
  if (filters.datePreset !== 'any') count++;
  return count;
}
