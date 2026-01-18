import { Event } from '@/lib/types';
import EventCard from './EventCard';

interface EventListProps {
  events: Event[];
  emptyMessage?: string;
}

export default function EventList({
  events,
  emptyMessage = 'No activities found matching your filters.',
}: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#f7f4ee] flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[#c4a882]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <p className="text-[#8a8578] text-lg">{emptyMessage}</p>
        <p className="text-[#d4d0c8] text-sm mt-2">Try adjusting your filters to find more activities.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
