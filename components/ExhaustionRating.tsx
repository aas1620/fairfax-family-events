import { EXHAUSTION_LABELS } from '@/lib/types';

interface ExhaustionRatingProps {
  rating: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function ExhaustionRating({ rating, showLabel = false, size = 'md' }: ExhaustionRatingProps) {
  const clampedRating = Math.min(5, Math.max(1, rating));

  // Battery fill percentages based on rating
  const fillPercentages: Record<number, number> = {
    1: 20,
    2: 40,
    3: 60,
    4: 80,
    5: 100,
  };

  const fillPercent = fillPercentages[clampedRating];

  // Color based on rating - from calm blue to energetic orange/red
  const colors: Record<number, { fill: string; text: string }> = {
    1: { fill: '#6b9bd1', text: 'text-[#6b9bd1]' }, // Calm blue
    2: { fill: '#7ab592', text: 'text-[#7ab592]' }, // Light green
    3: { fill: '#c4a882', text: 'text-[#c4a882]' }, // Tan/amber
    4: { fill: '#e8a54b', text: 'text-[#e8a54b]' }, // Orange
    5: { fill: '#e07b5c', text: 'text-[#e07b5c]' }, // Coral/red
  };

  const { fill, text } = colors[clampedRating];

  const sizeClasses = size === 'sm'
    ? { battery: 'w-6 h-3', label: 'text-xs' }
    : { battery: 'w-8 h-4', label: 'text-sm' };

  return (
    <div className="flex items-center gap-2">
      {/* Battery icon */}
      <div className={`relative ${sizeClasses.battery}`} title={`Exhaustion Index: ${clampedRating}/5 - ${EXHAUSTION_LABELS[clampedRating]}`}>
        {/* Battery outline */}
        <div className="absolute inset-0 border-2 border-[#8a8578] rounded-sm">
          {/* Battery fill */}
          <div
            className="absolute left-0 top-0 bottom-0 rounded-sm transition-all duration-300"
            style={{
              width: `${fillPercent}%`,
              backgroundColor: fill
            }}
          />
        </div>
        {/* Battery tip */}
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-2 bg-[#8a8578] rounded-r-sm" />
      </div>

      {/* Rating number */}
      <span className={`font-semibold ${text} ${sizeClasses.label}`}>
        {clampedRating}/5
      </span>

      {/* Optional label */}
      {showLabel && (
        <span className={`text-[#8a8578] ${sizeClasses.label}`}>
          {EXHAUSTION_LABELS[clampedRating]}
        </span>
      )}
    </div>
  );
}
