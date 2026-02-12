/**
 * Great Country Farms Event Scraper
 *
 * Fetches events from greatcountryfarms.com/festivals-events/ and updates events.json.
 * Preserves events from other sources.
 *
 * Usage: npm run refresh-gcf
 */

import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// Great Country Farms location data
const GCF_LOCATION = {
  venue: 'Great Country Farms',
  address: '18780 Foggy Bottom Rd',
  city: 'Bluemont',
  coordinates: { lat: 39.1067, lng: -77.8347 }
};

// Adult-only events to filter out (21+ events)
const ADULT_ONLY_EVENTS = [
  'adult corn maze',
  'adult egg hunt',
  'loco cider fest',
  'cider fest',
  '21+',
  'adults only',
  'beer',
  'wine tasting'
];

// Activity type mapping based on keywords
function inferActivityTypes(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const types: string[] = [];

  if (/strawberry|pumpkin|apple|harvest|farm|pick|peach|berry/i.test(text)) types.push('nature');
  if (/festival|jubilee|bash|hunt|celebration/i.test(text)) types.push('seasonal');
  if (/maze|hunt|dig|fishing|adventure/i.test(text)) types.push('adventure');
  if (/breakfast|santa|bunny|easter|christmas|holiday/i.test(text)) types.push('seasonal');
  if (/play|indoor|bounce|slide|jump/i.test(text)) types.push('physical-play');
  if (/animal|goat|pig|chicken|cow|petting/i.test(text)) types.push('nature');

  // Default to seasonal for farm events
  if (types.length === 0) types.push('seasonal');

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
function generateEventId(title: string, dateRange: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);

  // Extract month/year from date range (e.g., "October 1-31, 2026" -> "oct2026")
  const monthMatch = dateRange.match(/([a-z]+)/i);
  const yearMatch = dateRange.match(/\d{4}/);

  const monthSlug = monthMatch ? monthMatch[1].slice(0, 3).toLowerCase() : 'evt';
  const yearSlug = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();

  return `gcf-${slug}-${monthSlug}${yearSlug}`;
}

// Parse date range to start date
function parseDateRange(dateRange: string): { startDate: string; displayRange: string } | null {
  const months: Record<string, number> = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
    'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11,
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'jun': 5,
    'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
  };

  // Match patterns like "October 1-31, 2026" or "May 15 - June 10, 2026"
  const singleMonthMatch = dateRange.match(/([a-z]+)\s+(\d+)(?:\s*[-–]\s*(\d+))?,?\s*(\d{4})/i);

  if (singleMonthMatch) {
    const month = months[singleMonthMatch[1].toLowerCase()];
    if (month === undefined) return null;

    const startDay = parseInt(singleMonthMatch[2]);
    const year = parseInt(singleMonthMatch[4]);

    const startDate = new Date(year, month, startDay, 10, 0);
    return {
      startDate: startDate.toISOString().slice(0, 19),
      displayRange: dateRange.trim()
    };
  }

  // Try simpler format "Month Day, Year"
  const simpleMatch = dateRange.match(/([a-z]+)\s+(\d+),?\s*(\d{4})/i);
  if (simpleMatch) {
    const month = months[simpleMatch[1].toLowerCase()];
    if (month === undefined) return null;

    const day = parseInt(simpleMatch[2]);
    const year = parseInt(simpleMatch[3]);

    const startDate = new Date(year, month, day, 10, 0);
    return {
      startDate: startDate.toISOString().slice(0, 19),
      displayRange: dateRange.trim()
    };
  }

  return null;
}

// Check if event is adult-only
function isAdultOnlyEvent(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return ADULT_ONLY_EVENTS.some(keyword => text.includes(keyword));
}

interface ScrapedEvent {
  title: string;
  dateRange: string;
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

async function fetchEventsPage(): Promise<string> {
  const url = 'https://greatcountryfarms.com/festivals-events/';
  console.log(`Fetching: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`);
  }

  return response.text();
}

// Known GCF events with typical date patterns (updated annually)
// This serves as a fallback when scraping fails
const KNOWN_EVENTS = [
  { title: 'Baby Dino Days', monthPattern: 'February', keywords: ['dino', 'dinosaur', 'hatching'] },
  { title: 'Breakfast with Santa', monthPattern: 'December', keywords: ['santa', 'breakfast', 'christmas'] },
  { title: 'Easter Egg Hunt', monthPattern: 'April', keywords: ['easter', 'egg', 'hunt'] },
  { title: 'Breakfast with Easter Bunny', monthPattern: 'April', keywords: ['bunny', 'easter', 'breakfast'] },
  { title: 'Strawberry Jubilee', monthPattern: 'May', keywords: ['strawberry', 'jubilee'] },
  { title: 'Fish-a-Rama', monthPattern: 'June', keywords: ['fish', 'fishing', 'derby'] },
  { title: 'Pickle Fest', monthPattern: 'June', keywords: ['pickle', 'cucumber'] },
  { title: 'Sunflowers', monthPattern: 'July', keywords: ['sunflower'] },
  { title: 'Peach Fuzztival', monthPattern: 'July', keywords: ['peach', 'fuzztival'] },
  { title: 'Big Dig & Big Rigs', monthPattern: 'August', keywords: ['dig', 'rigs', 'potato', 'truck'] },
  { title: 'Watermelon Bash', monthPattern: 'August', keywords: ['watermelon', 'bash'] },
  { title: 'Apple Harvest & Corn Maze', monthPattern: 'September', keywords: ['apple', 'harvest', 'corn maze'] },
  { title: 'Family Flashlight Corn Maze', monthPattern: 'September', keywords: ['flashlight', 'maze', 'night'] },
  { title: 'Fall Pumpkin Harvest', monthPattern: 'October', keywords: ['pumpkin', 'harvest', 'fall'] },
  { title: 'Pumpkin Chunkin\'', monthPattern: 'November', keywords: ['chunkin', 'pumpkin'] },
];

function parseEventsPage(html: string): ScrapedEvent[] {
  const $ = cheerio.load(html);
  const events: ScrapedEvent[] = [];
  const pageText = $('body').text();

  // Date patterns to match various formats
  // "Feb 20 - Mar 2, 2026", "May 23-24, 30-31, 2026", "Oct 1-31, 2026"
  const datePatterns = [
    /([A-Z][a-z]+)\s+(\d+)\s*[-–]\s*([A-Z][a-z]+)\s+(\d+),?\s*(\d{4})/g,  // "Feb 20 - Mar 2, 2026"
    /([A-Z][a-z]+)\s+(\d+)[-–](\d+),?\s*(\d{4})/g,  // "Oct 1-31, 2026"
    /([A-Z][a-z]+)\s+(\d+),?\s*(\d{4})/g,  // "Jun 21, 2026"
  ];

  // Extract all text sections that might contain event info
  const sections: string[] = [];
  $('section, article, .event, .festival, div[class*="event"], div[class*="festival"], .wp-block-group, .wp-block-columns').each((_, el) => {
    sections.push($(el).text().trim());
  });

  // Also add full page text for fallback
  sections.push(pageText);

  // Look for event patterns in the page text
  for (const known of KNOWN_EVENTS) {
    // Skip adult-only events
    if (isAdultOnlyEvent(known.title, '')) continue;

    // Search for this event in the page text
    const titleRegex = new RegExp(known.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const keywordRegex = new RegExp(known.keywords.join('|'), 'i');

    if (titleRegex.test(pageText) || keywordRegex.test(pageText)) {
      // Try to find the date near this event
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;

      // Build a date estimate based on the month pattern
      const months: Record<string, number> = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
        'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
      };

      const month = months[known.monthPattern];
      const year = month < new Date().getMonth() ? nextYear : currentYear;

      // Try to find actual date in page text near this event
      let foundDate = '';
      for (const section of sections) {
        if (titleRegex.test(section) || keywordRegex.test(section)) {
          // Look for dates in this section
          const dateMatch = section.match(/([A-Z][a-z]+\s+\d+(?:\s*[-–]\s*(?:[A-Z][a-z]+\s+)?\d+)?(?:,\s*\d+-\d+)?,?\s*\d{4})/);
          if (dateMatch) {
            foundDate = dateMatch[1];
            break;
          }
        }
      }

      // Use found date or construct a default
      const dateRange = foundDate || `${known.monthPattern} 1, ${year}`;

      // Extract description from nearby text
      let description = known.title;
      for (const section of sections) {
        if (titleRegex.test(section) || keywordRegex.test(section)) {
          // Get a snippet around the title
          const match = section.match(new RegExp(`.{0,50}(${known.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}).{0,200}`, 'i'));
          if (match) {
            description = match[0].replace(/\s+/g, ' ').trim();
            break;
          }
        }
      }

      const isDuplicate = events.some(e => e.title.toLowerCase() === known.title.toLowerCase());
      if (!isDuplicate) {
        events.push({
          title: known.title,
          dateRange,
          description: description.slice(0, 300),
          eventUrl: 'https://greatcountryfarms.com/festivals-events/'
        });
      }
    }
  }

  // Also try to find any other events via heading patterns
  $('h1, h2, h3, h4, strong, b').each((_, heading) => {
    const $heading = $(heading);
    const title = $heading.text().trim();

    // Skip navigation/menu items and short titles
    if (!title || title.length < 5 || title.length > 50) return;
    if (/menu|nav|skip|home|about|contact|shop|directions|hours/i.test(title)) return;

    // Check if title looks like an event
    if (!/festival|harvest|hunt|jubilee|bash|breakfast|pick|pumpkin|apple|strawberry|easter|christmas|dino|sunflower|peach|watermelon|fish|pickle|maze|chunkin/i.test(title)) {
      return;
    }

    // Get surrounding text for date
    const $parent = $heading.closest('section, article, div');
    const surroundingText = $parent.text();

    const dateMatch = surroundingText.match(/([A-Z][a-z]+\s+\d+(?:\s*[-–]\s*(?:[A-Z][a-z]+\s+)?\d+)?(?:,\s*\d+-\d+)?,?\s*\d{4})/);

    if (dateMatch) {
      const isDuplicate = events.some(e => e.title.toLowerCase() === title.toLowerCase());
      if (!isDuplicate && !isAdultOnlyEvent(title, surroundingText)) {
        events.push({
          title,
          dateRange: dateMatch[1],
          description: surroundingText.slice(0, 300).replace(/\s+/g, ' ').trim(),
          eventUrl: 'https://greatcountryfarms.com/festivals-events/'
        });
      }
    }
  });

  return events;
}

function transformToEvent(scraped: ScrapedEvent): Event | null {
  // Filter out adult-only events
  if (isAdultOnlyEvent(scraped.title, scraped.description)) {
    console.log(`  Skipping adult-only event: ${scraped.title}`);
    return null;
  }

  const parsed = parseDateRange(scraped.dateRange);
  if (!parsed) {
    console.log(`  Skipping "${scraped.title}" - could not parse date: ${scraped.dateRange}`);
    return null;
  }

  const activityTypes = inferActivityTypes(scraped.title, scraped.description);

  // Build description including date range info
  let description = scraped.description;
  if (parsed.displayRange && !description.includes(parsed.displayRange)) {
    description = `${parsed.displayRange}. ${description}`;
  }

  return {
    id: generateEventId(scraped.title, scraped.dateRange),
    title: scraped.title,
    description: description.slice(0, 500),
    type: 'one-time',
    startDate: parsed.startDate,
    venue: GCF_LOCATION.venue,
    address: GCF_LOCATION.address,
    city: GCF_LOCATION.city,
    coordinates: GCF_LOCATION.coordinates,
    activityTypes,
    ageRange: { min: 0, max: 99 }, // Family-friendly
    cost: { amount: 15, per: 'person' }, // Typical admission price
    exhaustionRating: inferExhaustionRating(activityTypes),
    sourceUrl: scraped.eventUrl,
    source: 'great-country-farms',
    lastUpdated: new Date().toISOString().slice(0, 10)
  };
}

async function main() {
  const dataPath = path.join(__dirname, '..', 'data', 'events.json');

  console.log('=== Great Country Farms Event Scraper ===\n');

  // Read existing events
  console.log('Reading existing events.json...');
  const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as Event[];
  console.log(`  Found ${existingData.length} existing events`);

  // Separate GCF events from others
  const nonGcfEvents = existingData.filter(e => e.source !== 'great-country-farms');
  const existingGcfEvents = existingData.filter(e => e.source === 'great-country-farms');
  console.log(`  - ${nonGcfEvents.length} events from other sources (preserved)`);
  console.log(`  - ${existingGcfEvents.length} existing GCF events (will be refreshed)\n`);

  // Fetch and parse events page
  let scrapedEvents: ScrapedEvent[] = [];
  try {
    const html = await fetchEventsPage();
    scrapedEvents = parseEventsPage(html);
    console.log(`Scraped ${scrapedEvents.length} potential events from page\n`);
  } catch (error) {
    console.error('Error fetching events page:', error);
    return;
  }

  // Transform to Event format
  const newGcfEvents: Event[] = [];
  const seenIds = new Set<string>();

  for (const scraped of scrapedEvents) {
    const event = transformToEvent(scraped);
    if (event && !seenIds.has(event.id)) {
      seenIds.add(event.id);
      newGcfEvents.push(event);
      console.log(`  Added: ${event.title}`);
    }
  }

  console.log(`\nTransformed ${newGcfEvents.length} valid events`);

  // Merge: keep non-GCF events + new GCF events
  const mergedEvents = [...nonGcfEvents, ...newGcfEvents];

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
  console.log(`  - Preserved: ${nonGcfEvents.length} events from other sources`);
  console.log(`  - Added/Updated: ${newGcfEvents.length} Great Country Farms events`);
  console.log(`  - Total: ${mergedEvents.length} events`);
}

main().catch(console.error);
