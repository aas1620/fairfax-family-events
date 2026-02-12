'use client';

import Link from 'next/link';
import { Event, ACTIVITY_LABELS } from '@/lib/types';
import { useSavedEvents } from '@/lib/savedEvents';
import ExhaustionRating from './ExhaustionRating';

interface EventCardProps {
  event: Event;
}

function formatCost(cost: Event['cost']): string {
  if (cost.per === 'free' || cost.amount === 0) {
    return 'Free';
  }
  const perLabel = cost.per === 'family' ? '/family' : '/person';
  return `$${cost.amount}${perLabel}`;
}

function formatAgeRange(ageRange: Event['ageRange']): string {
  if (ageRange.min === 0 && ageRange.max >= 99) {
    return 'All ages';
  }
  if (ageRange.min === 0) {
    return `Up to ${ageRange.max}`;
  }
  if (ageRange.max >= 99) {
    return `Ages ${ageRange.min}+`;
  }
  return `Ages ${ageRange.min}-${ageRange.max}`;
}

function formatEventDate(startDate: string): string {
  const date = new Date(startDate);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getActivityIcon(activityTypes: Event['activityTypes']): { emoji: string; color: string } {
  if (activityTypes.includes('nature')) return { emoji: '🌿', color: '#4a7c59' };
  if (activityTypes.includes('science')) return { emoji: '🚀', color: '#5b7fa3' };
  if (activityTypes.includes('physical-play')) return { emoji: '🤸', color: '#d97706' };
  if (activityTypes.includes('adventure')) return { emoji: '🎯', color: '#b45309' };
  if (activityTypes.includes('arts')) return { emoji: '🎨', color: '#9333ea' };
  if (activityTypes.includes('history')) return { emoji: '🏛️', color: '#92400e' };
  if (activityTypes.includes('educational')) return { emoji: '📚', color: '#1e3a5f' };
  if (activityTypes.includes('seasonal')) return { emoji: '🍂', color: '#c2410c' };
  if (activityTypes.includes('music')) return { emoji: '🎵', color: '#be185d' };
  return { emoji: '✨', color: '#6b5344' };
}

// Get age range dots for visual indicator
function getAgeRangeDots(ageRange: Event['ageRange']): { baby: boolean; toddler: boolean; kids: boolean; tweens: boolean } {
  const { min, max } = ageRange;
  return {
    baby: min <= 2 && max >= 0,      // 0-2
    toddler: min <= 5 && max >= 2,    // 2-5
    kids: min <= 10 && max >= 5,      // 5-10
    tweens: min <= 13 && max >= 10,   // 10-13
  };
}

export default function EventCard({ event }: EventCardProps) {
  const { isSaved, toggleSaved } = useSavedEvents();
  const costDisplay = formatCost(event.cost);
  const isFree = event.cost.per === 'free' || event.cost.amount === 0;
  const { emoji, color } = getActivityIcon(event.activityTypes);
  const ageDots = getAgeRangeDots(event.ageRange);
  const saved = isSaved(event.id);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaved(event.id);
  };

  return (
    <article className="activity-card group bg-white rounded-2xl border border-[#e5dccb] overflow-hidden
                       hover:shadow-xl hover:-translate-y-1
                       transition-all duration-300 ease-out h-full flex flex-col">
      {/* Image area */}
      <div className="aspect-[4/3] bg-gradient-to-br from-[#f7f4ee] to-[#e8f3ec] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: `${color}40` }}
          >
            <span className="text-8xl drop-shadow-sm">
              {emoji}
            </span>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveClick}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 ${
            saved
              ? 'bg-red-50 text-red-500 shadow-sm'
              : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white'
          }`}
          aria-label={saved ? 'Remove from saved' : 'Save for later'}
        >
          <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>

        {/* Date badge for one-time events */}
        {event.type === 'one-time' && event.startDate && (
          <div className="absolute top-3 left-3 bg-[#1e3a5f] text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
            {formatEventDate(event.startDate)}
          </div>
        )}

        {/* FREE badge - more prominent */}
        {isFree && (
          <div className="absolute bottom-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wide">
            Free
          </div>
        )}

        {/* Venue type indicator */}
        {event.type === 'recurring' && !isFree && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-[#6b5344] text-xs font-medium px-2.5 py-1 rounded-full">
            Open Year-Round
          </div>
        )}
        {event.type === 'recurring' && isFree && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-[#6b5344] text-xs font-medium px-2.5 py-1 rounded-full">
            Open Year-Round
          </div>
        )}
      </div>

      <Link href={`/events/${event.id}`} className="flex flex-col flex-grow">
        <div className="p-5 flex flex-col flex-grow">
          {/* Activity type badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {event.activityTypes.slice(0, 2).map((type) => (
              <span
                key={type}
                className="text-xs bg-[#f7f4ee] text-[#6b5344] px-2.5 py-1 rounded-full font-medium"
              >
                {ACTIVITY_LABELS[type]}
              </span>
            ))}
            {event.activityTypes.length > 2 && (
              <span className="text-xs text-[#8a8578] px-1">
                +{event.activityTypes.length - 2}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-[#3d3a35] group-hover:text-[#5a9470] transition-colors text-lg leading-snug line-clamp-2">
            {event.title}
          </h3>

          {/* Location */}
          <p className="text-sm text-[#8a8578] mt-1.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {event.city}
          </p>

          {/* Description */}
          <p className="text-sm text-[#5c5850] mt-3 line-clamp-2 flex-grow leading-relaxed">
            {event.description}
          </p>

          {/* Meta info */}
          <div className="mt-4 pt-4 border-t border-[#f0ebe0]">
            <div className="flex items-center justify-between">
              {/* Age range with visual dots */}
              <div className="flex items-center gap-2">
                <span className="flex gap-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${ageDots.baby ? 'bg-[#5a9470]' : 'bg-gray-300'}`} title="Babies (0-2)"></span>
                  <span className={`w-1.5 h-1.5 rounded-full ${ageDots.toddler ? 'bg-[#5a9470]' : 'bg-gray-300'}`} title="Toddlers (2-5)"></span>
                  <span className={`w-1.5 h-1.5 rounded-full ${ageDots.kids ? 'bg-[#5a9470]' : 'bg-gray-300'}`} title="Kids (5-10)"></span>
                  <span className={`w-1.5 h-1.5 rounded-full ${ageDots.tweens ? 'bg-[#5a9470]' : 'bg-gray-300'}`} title="Tweens (10-13)"></span>
                </span>
                <span className="text-xs text-[#8a8578] font-medium">
                  {formatAgeRange(event.ageRange)}
                </span>
              </div>
              <span
                className={`text-sm font-semibold ${
                  isFree ? 'text-[#5a9470]' : 'text-[#6b5344]'
                }`}
              >
                {costDisplay}
              </span>
            </div>
            {event.exhaustionRating && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs text-[#8a8578]">Energy burn:</span>
                <ExhaustionRating rating={event.exhaustionRating} size="sm" />
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
