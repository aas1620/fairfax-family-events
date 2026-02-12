/**
 * Udvar-Hazy Center (Smithsonian) Event Scraper
 *
 * Fetches events from the Smithsonian Air and Space Museum's Udvar-Hazy Center
 * and updates events.json. All events are free.
 *
 * URL: https://airandspace.si.edu/whats-on/events?location[133]=133&building=133
 *
 * Usage: npm run refresh-udvar-hazy
 */

import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// Udvar-Hazy Center location data
const UDVAR_HAZY_LOCATION = {
  venue: 'Steven F. Udvar-Hazy Center',
  address: '14390 Air and Space Museum Pkwy',
  city: 'Chantilly',
  coordinates: { lat: 38.9114, lng: -77.4439 }
};

// Activity type mapping based on keywords
function inferActivityTypes(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const types: string[] = [];

  if (/story|storytime|read|book/i.test(text)) types.push('educational');
  if (/star|planet|moon|sun|telescope|astronomy|night sky|stargazing/i.test(text)) types.push('science');
  if (/space|rocket|aviation|aircraft|flight|shuttle|plane|pilot/i.test(text)) types.push('science');
  if (/history|historic|war|wwii|world war/i.test(text)) types.push('history');
  if (/hands.?on|build|create|make|workshop/i.test(text)) types.push('science');
  if (/tour|walk|explore/i.test(text)) types.push('educational');

  // Default to educational for museum events
  if (types.length === 0) types.push('educational');

  // Remove duplicates
  return Array.from(new Set(types));
}

// Infer exhaustion rating from activity types
function inferExhaustionRating(activityTypes: string[]): number {
  const ratings: Record<string, number> = {
    'educational': 1,
    'history': 1,
    'arts': 2,
    'music': 2,
    'science': 2,
    'nature': 3,
    'seasonal': 3,
    'adventure': 4,
    'physical-play': 4,
  };

  let maxRating = 1;
  for (const type of activityTypes) {
    maxRating = Math.max(maxRating, ratings[type] || 1);
  }
  return maxRating;
}

// Generate unique event ID
function generateEventId(title: string, date: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);

  // Format date for ID (e.g., "2026-02-15" -> "feb2026")
  const dateObj = new Date(date);
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthSlug = months[dateObj.getMonth()] || 'evt';
  const yearSlug = dateObj.getFullYear().toString();
  const daySlug = dateObj.getDate().toString().padStart(2, '0');

  return `uh-${slug}-${monthSlug}${daySlug}-${yearSlug}`;
}

// Parse various date formats from the page
function parseEventDate(dateText: string): string | null {
  const months: Record<string, number> = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
    'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11,
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'jun': 5,
    'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
  };

  // Match "Month Day, Year" or "Month Day Year"
  const fullMatch = dateText.match(/([a-z]+)\s+(\d+),?\s*(\d{4})/i);
  if (fullMatch) {
    const month = months[fullMatch[1].toLowerCase()];
    if (month !== undefined) {
      const day = parseInt(fullMatch[2]);
      const year = parseInt(fullMatch[3]);
      return new Date(year, month, day, 10, 0).toISOString().slice(0, 19);
    }
  }

  // Match "Day Month Year"
  const euroMatch = dateText.match(/(\d+)\s+([a-z]+)\s+(\d{4})/i);
  if (euroMatch) {
    const month = months[euroMatch[2].toLowerCase()];
    if (month !== undefined) {
      const day = parseInt(euroMatch[1]);
      const year = parseInt(euroMatch[3]);
      return new Date(year, month, day, 10, 0).toISOString().slice(0, 19);
    }
  }

  // Match ISO-like "YYYY-MM-DD"
  const isoMatch = dateText.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1]);
    const month = parseInt(isoMatch[2]) - 1;
    const day = parseInt(isoMatch[3]);
    return new Date(year, month, day, 10, 0).toISOString().slice(0, 19);
  }

  return null;
}

// Parse time from text like "10:30 AM - 11:30 AM"
function parseEventTime(timeText: string): { start: string; end: string } | null {
  const timeMatch = timeText.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)\s*[-–]?\s*(\d{1,2})?:?(\d{2})?\s*(am|pm)?/i);

  if (timeMatch) {
    let startHour = parseInt(timeMatch[1]);
    const startMin = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const startPeriod = timeMatch[3].toLowerCase();

    if (startPeriod === 'pm' && startHour !== 12) startHour += 12;
    if (startPeriod === 'am' && startHour === 12) startHour = 0;

    const start = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;

    // Parse end time if present
    if (timeMatch[4]) {
      let endHour = parseInt(timeMatch[4]);
      const endMin = timeMatch[5] ? parseInt(timeMatch[5]) : 0;
      const endPeriod = (timeMatch[6] || startPeriod).toLowerCase();

      if (endPeriod === 'pm' && endHour !== 12) endHour += 12;
      if (endPeriod === 'am' && endHour === 12) endHour = 0;

      const end = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      return { start, end };
    }

    // Default to 1 hour duration
    const endHour = (startHour + 1) % 24;
    const end = `${endHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
    return { start, end };
  }

  return null;
}

interface ScrapedEvent {
  title: string;
  date: string;
  time: string;
  description: string;
  eventUrl: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'one-time' | 'recurring';
  startDate?: string;
  endDate?: string;
  schedule?: {
    daysOfWeek?: number[];
    hours: { open: string; close: string };
    seasonalNotes?: string;
  };
  venue: string;
  address: string;
  city: string;
  coordinates: { lat: number; lng: number };
  activityTypes: string[];
  ageRange: { min: number; max: number };
  cost: { amount: number; per: 'person' | 'family' | 'free' };
  exhaustionRating?: number;
  parentHacks?: string[];
  sourceUrl: string;
  source: string;
  imageUrl?: string;
  lastUpdated: string;
}

async function fetchEventsPage(page: number = 0): Promise<string> {
  const url = `https://airandspace.si.edu/whats-on/events?location[133]=133&building=133&page=${page}`;
  console.log(`Fetching page ${page}: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; FamilyEventsBot/1.0)'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page ${page}: ${response.status}`);
  }

  return response.text();
}

function parseEventsPage(html: string): ScrapedEvent[] {
  const $ = cheerio.load(html);
  const events: ScrapedEvent[] = [];

  // Smithsonian event cards typically have structured data
  // Look for event card patterns
  $('article, .event-card, .views-row, [class*="event"], .card').each((_, element) => {
    const $el = $(element);

    // Try various selectors for title
    const $titleEl = $el.find('h2 a, h3 a, .event-title a, .title a, a[href*="/event"]').first();
    const title = $titleEl.text().trim() || $el.find('h2, h3, .event-title, .title').first().text().trim();

    if (!title || title.length < 3) return;

    // Get link
    let link = $titleEl.attr('href') || $el.find('a').first().attr('href') || '';
    if (link && !link.startsWith('http')) {
      link = `https://airandspace.si.edu${link}`;
    }

    // Try to find date - Smithsonian often uses .date or time elements
    const dateText = $el.find('.date, time, .event-date, [datetime]').first().text().trim()
      || $el.find('[class*="date"]').first().text().trim()
      || '';

    // Try to find time
    const timeText = $el.find('.time, .event-time, [class*="time"]').first().text().trim() || '';

    // Get description
    const description = $el.find('p, .description, .summary, .teaser, .body').first().text().trim();

    if (title && dateText) {
      events.push({
        title,
        date: dateText,
        time: timeText,
        description: description || title,
        eventUrl: link || 'https://airandspace.si.edu/whats-on/events?location[133]=133&building=133'
      });
    }
  });

  // Also try to parse from structured event listings
  $('[itemtype*="Event"], [typeof="Event"]').each((_, element) => {
    const $el = $(element);

    const title = $el.find('[itemprop="name"], [property="name"]').text().trim();
    const dateText = $el.find('[itemprop="startDate"], [property="startDate"]').attr('content')
      || $el.find('[itemprop="startDate"], [property="startDate"]').text().trim();
    const description = $el.find('[itemprop="description"], [property="description"]').text().trim();
    const link = $el.find('[itemprop="url"], a').first().attr('href') || '';

    if (title && dateText) {
      const isDuplicate = events.some(e => e.title.toLowerCase() === title.toLowerCase());
      if (!isDuplicate) {
        events.push({
          title,
          date: dateText,
          time: '',
          description: description || title,
          eventUrl: link.startsWith('http') ? link : `https://airandspace.si.edu${link}`
        });
      }
    }
  });

  return events;
}

function transformToEvent(scraped: ScrapedEvent): Event | null {
  const parsedDate = parseEventDate(scraped.date);
  if (!parsedDate) {
    console.log(`  Skipping "${scraped.title}" - could not parse date: ${scraped.date}`);
    return null;
  }

  const activityTypes = inferActivityTypes(scraped.title, scraped.description);

  // Parse time if available
  const parsedTime = parseEventTime(scraped.time);
  let startDate = parsedDate;
  let endDate: string | undefined;

  if (parsedTime) {
    const dateOnly = parsedDate.split('T')[0];
    startDate = `${dateOnly}T${parsedTime.start}`;
    endDate = `${dateOnly}T${parsedTime.end}`;
  }

  return {
    id: generateEventId(scraped.title, parsedDate),
    title: scraped.title,
    description: scraped.description.slice(0, 500),
    type: 'one-time',
    startDate,
    endDate,
    venue: UDVAR_HAZY_LOCATION.venue,
    address: UDVAR_HAZY_LOCATION.address,
    city: UDVAR_HAZY_LOCATION.city,
    coordinates: UDVAR_HAZY_LOCATION.coordinates,
    activityTypes,
    ageRange: { min: 0, max: 99 }, // Family-friendly, all ages
    cost: { amount: 0, per: 'free' }, // Smithsonian is always free
    exhaustionRating: inferExhaustionRating(activityTypes),
    sourceUrl: scraped.eventUrl,
    source: 'udvar-hazy',
    lastUpdated: new Date().toISOString().slice(0, 10)
  };
}

async function main() {
  const dataPath = path.join(__dirname, '..', 'data', 'events.json');

  console.log('=== Udvar-Hazy Center Event Scraper ===\n');

  // Read existing events
  console.log('Reading existing events.json...');
  const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as Event[];
  console.log(`  Found ${existingData.length} existing events`);

  // Separate Udvar-Hazy events from others
  const nonUhEvents = existingData.filter(e => e.source !== 'udvar-hazy');
  const existingUhEvents = existingData.filter(e => e.source === 'udvar-hazy');
  console.log(`  - ${nonUhEvents.length} events from other sources (preserved)`);
  console.log(`  - ${existingUhEvents.length} existing Udvar-Hazy events (will be refreshed)\n`);

  // Fetch and parse events pages
  const allScrapedEvents: ScrapedEvent[] = [];

  // Fetch multiple pages (they have ~49 events across pages)
  for (let page = 0; page < 5; page++) {
    try {
      const html = await fetchEventsPage(page);
      const events = parseEventsPage(html);

      if (events.length === 0) {
        console.log(`  Page ${page}: No events found, stopping pagination`);
        break;
      }

      console.log(`  Page ${page}: Found ${events.length} events`);
      allScrapedEvents.push(...events);

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  Error fetching page ${page}:`, error);
      break;
    }
  }

  console.log(`\nTotal scraped events: ${allScrapedEvents.length}\n`);

  // Transform to Event format
  const newUhEvents: Event[] = [];
  const seenIds = new Set<string>();

  for (const scraped of allScrapedEvents) {
    const event = transformToEvent(scraped);
    if (event && !seenIds.has(event.id)) {
      seenIds.add(event.id);
      newUhEvents.push(event);
      console.log(`  Added: ${event.title}`);
    }
  }

  console.log(`\nTransformed ${newUhEvents.length} valid events`);

  // Merge: keep non-UH events + new UH events
  const mergedEvents = [...nonUhEvents, ...newUhEvents];

  // Sort by date (recurring events first, then by startDate)
  mergedEvents.sort((a, b) => {
    if (a.type === 'recurring' && b.type !== 'recurring') return -1;
    if (a.type !== 'recurring' && b.type === 'recurring') return 1;
    if (a.startDate && b.startDate) {
      return a.startDate.localeCompare(b.startDate);
    }
    return a.title.localeCompare(b.title);
  });

  // Write updated events.json
  console.log(`\nWriting ${mergedEvents.length} events to events.json...`);
  fs.writeFileSync(dataPath, JSON.stringify(mergedEvents, null, 2) + '\n');

  console.log('\nDone!');
  console.log(`  - Preserved: ${nonUhEvents.length} events from other sources`);
  console.log(`  - Added/Updated: ${newUhEvents.length} Udvar-Hazy Center events`);
  console.log(`  - Total: ${mergedEvents.length} events`);
}

main().catch(console.error);
