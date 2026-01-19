import { Event } from './types';
import eventsData from '@/data/events.json';

export function getAllEvents(): Event[] {
  return eventsData as Event[];
}

export function getEventById(id: string): Event | undefined {
  return getAllEvents().find((event) => event.id === id);
}

export function getFeaturedEvents(count: number = 6): Event[] {
  // Return a mix of free and paid, different activity types
  const events = getAllEvents();
  const freeEvents = events.filter(
    (e) => e.cost.per === 'free' || e.cost.amount === 0
  );
  const paidEvents = events.filter(
    (e) => e.cost.per !== 'free' && e.cost.amount > 0
  );

  // Interleave free and paid events
  const featured: Event[] = [];
  let freeIdx = 0;
  let paidIdx = 0;

  while (featured.length < count && (freeIdx < freeEvents.length || paidIdx < paidEvents.length)) {
    if (freeIdx < freeEvents.length) {
      featured.push(freeEvents[freeIdx++]);
    }
    if (featured.length < count && paidIdx < paidEvents.length) {
      featured.push(paidEvents[paidIdx++]);
    }
  }

  return featured.slice(0, count);
}

export function getEventsByActivityType(activityType: string): Event[] {
  return getAllEvents().filter((event) =>
    event.activityTypes.includes(activityType as Event['activityTypes'][number])
  );
}

export function getThisWeekendEvents(): Event[] {
  const events = getAllEvents();
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Calculate this Saturday and Sunday
  const daysUntilSaturday = dayOfWeek === 0 ? -1 : dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + daysUntilSaturday);
  saturday.setHours(0, 0, 0, 0);

  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  sunday.setHours(23, 59, 59, 999);

  // Get one-time events happening this weekend
  const oneTimeEvents = events.filter((event) => {
    if (event.type !== 'one-time' || !event.startDate) return false;
    const eventDate = new Date(event.startDate);
    return eventDate >= saturday && eventDate <= sunday;
  });

  // Get a variety of recurring events (venues open year-round)
  const recurringEvents = events.filter((event) => event.type === 'recurring');

  // Mix of one-time weekend events and popular recurring venues
  // Prioritize one-time events, then fill with high-exhaustion recurring
  const sortedRecurring = recurringEvents.sort((a, b) => {
    // Prioritize by exhaustion rating (high energy activities are popular for weekends)
    const aRating = a.exhaustionRating || 3;
    const bRating = b.exhaustionRating || 3;
    return bRating - aRating;
  });

  // Combine: one-time events first, then popular recurring
  return [...oneTimeEvents, ...sortedRecurring].slice(0, 8);
}
