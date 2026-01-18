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
