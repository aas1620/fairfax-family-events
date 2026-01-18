export type ActivityType =
  | 'adventure'
  | 'arts'
  | 'history'
  | 'science'
  | 'physical-play'
  | 'nature'
  | 'music'
  | 'seasonal'
  | 'educational';

export interface RecurringSchedule {
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  hours: { open: string; close: string };
  seasonalNotes?: string; // e.g., "Closed Jan-Feb"
}

export interface Event {
  id: string;
  title: string;
  description: string;

  // Timing
  type: 'one-time' | 'recurring';
  startDate?: string; // ISO date string for one-time events
  endDate?: string;
  schedule?: RecurringSchedule; // for recurring venues

  // Location
  venue: string;
  address: string;
  city: string; // Fairfax, Reston, Herndon, etc.
  coordinates: { lat: number; lng: number };

  // Filtering
  activityTypes: ActivityType[];
  ageRange: { min: number; max: number };
  cost: { amount: number; per: 'person' | 'family' | 'free' };

  // Meta
  sourceUrl: string;
  source:
    | 'fairfax-parks'
    | 'smithsonian'
    | 'great-country-farms'
    | 'artsfairfax'
    | 'library'
    | 'manual';
  imageUrl?: string;
  lastUpdated: string; // ISO date string
}

export interface FilterState {
  activityTypes: ActivityType[];
  cities: string[];
  maxCost: number | null; // null = any price
  ageRange: { min: number; max: number } | null;
  datePreset: DatePreset;
  sortBy: SortOption;
}

export const CITIES = [
  'Fairfax',
  'Vienna',
  'Reston',
  'Herndon',
  'Chantilly',
  'Centreville',
  'McLean',
  'Falls Church',
  'Arlington',
  'Ashburn',
  'Sterling',
] as const;

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  adventure: 'Adventure',
  arts: 'Arts & Crafts',
  history: 'History',
  science: 'Science',
  'physical-play': 'Physical Play',
  nature: 'Nature',
  music: 'Music',
  seasonal: 'Seasonal',
  educational: 'Educational',
};

export const AGE_PRESETS = [
  { label: 'Baby/Toddler', min: 0, max: 3 },
  { label: 'Preschool', min: 3, max: 5 },
  { label: 'Kids', min: 5, max: 10 },
  { label: 'Tweens', min: 10, max: 13 },
  { label: 'All Ages', min: 0, max: 99 },
] as const;

export const COST_PRESETS = [
  { label: 'Free', maxAmount: 0 },
  { label: 'Under $10', maxAmount: 10 },
  { label: 'Under $25', maxAmount: 25 },
  { label: 'Any Price', maxAmount: null },
] as const;

export type SortOption = 'date-asc' | 'date-desc' | 'name' | 'cost';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date-asc', label: 'Date (Soonest)' },
  { value: 'date-desc', label: 'Date (Latest)' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'cost', label: 'Cost (Low to High)' },
];

export type DatePreset = 'any' | 'this-weekend' | 'this-week' | 'this-month' | 'next-month';

export const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'any', label: 'Any Date' },
  { value: 'this-weekend', label: 'This Weekend' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'next-month', label: 'Next Month' },
];
