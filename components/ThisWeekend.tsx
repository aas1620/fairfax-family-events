'use client';

import Link from 'next/link';
import { Event, ACTIVITY_LABELS } from '@/lib/types';
import ExhaustionRating from './ExhaustionRating';

interface ThisWeekendProps {
  events: Event[];
}

function getActivityIcon(activityTypes: Event['activityTypes']): string {
  if (activityTypes.includes('nature')) return '🌿';
  if (activityTypes.includes('science')) return '🔬';
  if (activityTypes.includes('physical-play')) return '⚡';
  if (activityTypes.includes('adventure')) return '🎯';
  if (activityTypes.includes('arts')) return '🎨';
  if (activityTypes.includes('history')) return '📜';
  if (activityTypes.includes('educational')) return '📚';
  if (activityTypes.includes('seasonal')) return '🍂';
  if (activityTypes.includes('music')) return '🎵';
  return '✨';
}

function formatCost(cost: Event['cost']): string {
  if (cost.per === 'free' || cost.amount === 0) {
    return 'Free';
  }
  return `$${cost.amount}`;
}

function getWeekendDateRange(): { saturday: Date; sunday: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Calculate days until Saturday
  const daysUntilSaturday = dayOfWeek === 0 ? 6 : (6 - dayOfWeek);

  // If it's already Saturday or Sunday, use this weekend
  const saturday = new Date(now);
  if (dayOfWeek === 6) {
    // It's Saturday
    saturday.setDate(now.getDate());
  } else if (dayOfWeek === 0) {
    // It's Sunday, show this Sunday and next Saturday would be confusing
    // Just show today
    saturday.setDate(now.getDate() - 1);
  } else {
    saturday.setDate(now.getDate() + daysUntilSaturday);
  }

  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);

  return { saturday, sunday };
}

function formatWeekendRange(): string {
  const { saturday, sunday } = getWeekendDateRange();
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

  return `${saturday.toLocaleDateString('en-US', options)} - ${sunday.toLocaleDateString('en-US', options)}`;
}

export default function ThisWeekend({ events }: ThisWeekendProps) {
  // Take up to 4 events to display
  const featuredEvents = events.slice(0, 4);

  if (featuredEvents.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-b from-[#f7f4ee] to-[#fdfcfa] py-12 border-b border-[#e5dccb]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🗓️</span>
              <h2 className="text-2xl font-bold text-[#3d3a35]">This Weekend</h2>
            </div>
            <p className="text-[#8a8578]">
              Top picks for {formatWeekendRange()}
            </p>
          </div>
          <Link
            href="/events?date=this-weekend"
            className="hidden sm:inline-flex items-center gap-2 text-[#5a9470] hover:text-[#4a7d5e] font-medium transition-colors"
          >
            View all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Featured Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredEvents.map((event) => {
            const isFree = event.cost.per === 'free' || event.cost.amount === 0;

            return (
              <Link key={event.id} href={`/events/${event.id}`} className="group block">
                <article className="bg-white rounded-2xl border border-[#e5dccb] overflow-hidden hover:shadow-lg hover:shadow-[#d4c4a8]/20 transition-all duration-300 h-full flex flex-col">
                  {/* Image area */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#f7f4ee] to-[#e8f3ec] relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl opacity-40 group-hover:scale-110 transition-transform duration-300">
                        {getActivityIcon(event.activityTypes)}
                      </span>
                    </div>
                    {isFree && (
                      <div className="absolute top-3 right-3 bg-[#5a9470] text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                        Free
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    {/* Activity type badge */}
                    <span className="inline-block text-xs bg-[#f7f4ee] text-[#6b5344] px-2.5 py-1 rounded-full font-medium w-fit mb-2">
                      {ACTIVITY_LABELS[event.activityTypes[0]]}
                    </span>

                    {/* Title */}
                    <h3 className="font-semibold text-[#3d3a35] group-hover:text-[#1e3a5f] transition-colors leading-snug line-clamp-2 flex-grow">
                      {event.title}
                    </h3>

                    {/* Location */}
                    <p className="text-sm text-[#8a8578] mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {event.city}
                    </p>

                    {/* Footer with cost and exhaustion */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f0ebe0]">
                      <span className={`text-sm font-semibold ${isFree ? 'text-[#5a9470]' : 'text-[#6b5344]'}`}>
                        {formatCost(event.cost)}
                      </span>
                      {event.exhaustionRating && (
                        <ExhaustionRating rating={event.exhaustionRating} size="sm" />
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* Mobile "View all" link */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/events?date=this-weekend"
            className="inline-flex items-center gap-2 text-[#5a9470] hover:text-[#4a7d5e] font-medium transition-colors"
          >
            View all weekend activities
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
