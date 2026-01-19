/**
 * Fairfax County Parks Event Scraper
 *
 * Fetches events from the Fairfax County Parks calendar and updates events.json.
 * Preserves events from other sources (manual, smithsonian, great-country-farms, library).
 *
 * Usage: npm run refresh-parks
 */

import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// Park location data
const PARK_LOCATIONS: Record<string, { address: string; city: string; coordinates: { lat: number; lng: number } }> = {
  'Frying Pan Farm Park': { address: '2709 West Ox Rd', city: 'Herndon', coordinates: { lat: 38.9289, lng: -77.3506 } },
  'Frying Pan Park': { address: '2709 West Ox Rd', city: 'Herndon', coordinates: { lat: 38.9289, lng: -77.3506 } },
  'Hidden Oaks Nature Center': { address: '7701 Royce St', city: 'Annandale', coordinates: { lat: 38.8302, lng: -77.2006 } },
  'Hidden Oaks': { address: '7701 Royce St', city: 'Annandale', coordinates: { lat: 38.8302, lng: -77.2006 } },
  'Green Spring Gardens': { address: '4603 Green Spring Rd', city: 'Alexandria', coordinates: { lat: 38.7874, lng: -77.1153 } },
  'Green Spring': { address: '4603 Green Spring Rd', city: 'Alexandria', coordinates: { lat: 38.7874, lng: -77.1153 } },
  'Burke Lake Park': { address: '7315 Ox Rd', city: 'Fairfax Station', coordinates: { lat: 38.7598, lng: -77.2969 } },
  'Burke Lake': { address: '7315 Ox Rd', city: 'Fairfax Station', coordinates: { lat: 38.7598, lng: -77.2969 } },
  'Lake Accotink Park': { address: '7500 Accotink Park Rd', city: 'Springfield', coordinates: { lat: 38.7926, lng: -77.2203 } },
  'Lake Accotink': { address: '7500 Accotink Park Rd', city: 'Springfield', coordinates: { lat: 38.7926, lng: -77.2203 } },
  'Turner Farm': { address: '925 Springvale Rd', city: 'Great Falls', coordinates: { lat: 38.9728, lng: -77.2867 } },
  'Riverbend Park': { address: '8700 Potomac Hills St', city: 'Great Falls', coordinates: { lat: 39.0178, lng: -77.2447 } },
  'Riverbend': { address: '8700 Potomac Hills St', city: 'Great Falls', coordinates: { lat: 39.0178, lng: -77.2447 } },
  'Huntley Meadows Park': { address: '3701 Lockheed Blvd', city: 'Alexandria', coordinates: { lat: 38.7567, lng: -77.0989 } },
  'Huntley Meadows': { address: '3701 Lockheed Blvd', city: 'Alexandria', coordinates: { lat: 38.7567, lng: -77.0989 } },
  'Ellanor C. Lawrence Park': { address: '5040 Walney Rd', city: 'Chantilly', coordinates: { lat: 38.8706, lng: -77.4217 } },
  'Ellanor C. Lawrence': { address: '5040 Walney Rd', city: 'Chantilly', coordinates: { lat: 38.8706, lng: -77.4217 } },
  'Colvin Run Mill': { address: '10017 Colvin Run Rd', city: 'Great Falls', coordinates: { lat: 38.9378, lng: -77.2442 } },
  'Lake Fairfax Park': { address: '1400 Lake Fairfax Dr', city: 'Reston', coordinates: { lat: 38.9614, lng: -77.3419 } },
  'Lake Fairfax': { address: '1400 Lake Fairfax Dr', city: 'Reston', coordinates: { lat: 38.9614, lng: -77.3419 } },
  'Hidden Pond Nature Center': { address: '8511 Greeley Blvd', city: 'Springfield', coordinates: { lat: 38.7867, lng: -77.2267 } },
  'Hidden Pond': { address: '8511 Greeley Blvd', city: 'Springfield', coordinates: { lat: 38.7867, lng: -77.2267 } },
  'Sully Historic Site': { address: '3650 Historic Sully Way', city: 'Chantilly', coordinates: { lat: 38.9289, lng: -77.4467 } },
  'Twin Lakes Golf Course': { address: '6201 Union Mill Rd', city: 'Clifton', coordinates: { lat: 38.8078, lng: -77.4311 } },
  'Twin Lakes Golf': { address: '6201 Union Mill Rd', city: 'Clifton', coordinates: { lat: 38.8078, lng: -77.4311 } },
  'Cub Run Rec Center': { address: '4630 Stonecroft Blvd', city: 'Chantilly', coordinates: { lat: 38.8756, lng: -77.4361 } },
  'Audrey Moore Rec Center': { address: '8100 Braddock Rd', city: 'Annandale', coordinates: { lat: 38.8242, lng: -77.2139 } },
  'Audrey Moore': { address: '8100 Braddock Rd', city: 'Annandale', coordinates: { lat: 38.8242, lng: -77.2139 } },
  'Franconia Rec Center': { address: '6229 Frontier Dr', city: 'Springfield', coordinates: { lat: 38.7714, lng: -77.1478 } },
  'Mount Vernon Rec Center': { address: '2017 Belle View Blvd', city: 'Alexandria', coordinates: { lat: 38.7733, lng: -77.0594 } },
  'Oakmont Rec Center': { address: '2800 Sutton Rd', city: 'Vienna', coordinates: { lat: 38.8917, lng: -77.2897 } },
  'Oakmont': { address: '2800 Sutton Rd', city: 'Vienna', coordinates: { lat: 38.8917, lng: -77.2897 } },
};

// Activity type mapping based on keywords
function inferActivityTypes(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const types: string[] = [];

  if (/nature|wildlife|bird|animal|forest|tree|plant|garden|wetland|creek|stream|fox|owl|squirrel|salamander|turtle|snake/.test(text)) {
    types.push('nature');
  }
  if (/science|lab|experiment|biology|astronomy|star|space|biomimicry/.test(text)) {
    types.push('science');
  }
  if (/history|historic|colonial|enslaved|black history|meeting house/.test(text)) {
    types.push('history');
  }
  if (/art|craft|paint|draw|sketch|valentine|card making|pottery/.test(text)) {
    types.push('arts');
  }
  if (/hike|walk|campfire|adventure|fire building|lantern/.test(text)) {
    types.push('adventure');
  }
  if (/play|playground|physical|active/.test(text)) {
    types.push('physical-play');
  }
  if (/music|concert|quartet|performance/.test(text)) {
    types.push('music');
  }
  if (/seasonal|lunar|new year|holiday|valentine|easter|halloween/.test(text)) {
    types.push('seasonal');
  }
  if (/learn|education|class|workshop|lecture|storytime|homeschool/.test(text)) {
    types.push('educational');
  }

  // Default to educational if no types found
  if (types.length === 0) {
    types.push('educational');
  }

  return types;
}

// Parse age range from text like "4-8 yrs", "16+", "All Ages"
function parseAgeRange(ageText: string): { min: number; max: number } {
  if (!ageText || /all ages?/i.test(ageText) || /general/i.test(ageText)) {
    return { min: 0, max: 99 };
  }

  // Handle "16+" or "Adults" style
  if (/adults?/i.test(ageText) && !/\d/.test(ageText)) {
    return { min: 18, max: 99 };
  }

  const plusMatch = ageText.match(/(\d+)\+/);
  if (plusMatch) {
    return { min: parseInt(plusMatch[1]), max: 99 };
  }

  // Handle "4-8 yrs" style
  const rangeMatch = ageText.match(/(\d+)\s*[-–to]+\s*(\d+)/);
  if (rangeMatch) {
    return { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) };
  }

  // Handle single age
  const singleMatch = ageText.match(/(\d+)/);
  if (singleMatch) {
    return { min: parseInt(singleMatch[1]), max: 99 };
  }

  return { min: 0, max: 99 };
}

// Parse date string like "Jan 25" or "Jan25" to ISO date
function parseEventDate(dateStr: string, timeStr: string, year: number = new Date().getFullYear()): string {
  const months: Record<string, number> = {
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
  };

  // Handle both "Jan 25" and "Jan25" formats
  const monthMatch = dateStr.toLowerCase().match(/([a-z]+)\s*(\d+)/);
  if (!monthMatch) return '';

  const month = months[monthMatch[1].slice(0, 3)];
  if (month === undefined) return '';
  const day = parseInt(monthMatch[2]);

  // Parse time like "1:30 PM" or "10:00 AM"
  let hours = 10;
  let minutes = 0;
  const timeMatch = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (timeMatch) {
    hours = parseInt(timeMatch[1]);
    minutes = parseInt(timeMatch[2]);
    if (timeMatch[3].toLowerCase() === 'pm' && hours !== 12) {
      hours += 12;
    }
    if (timeMatch[3].toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }
  }

  const date = new Date(year, month, day, hours, minutes);
  return date.toISOString().slice(0, 19);
}

// Generate slug ID from title and date
function generateEventId(title: string, dateStr: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);

  const dateMatch = dateStr.toLowerCase().match(/([a-z]+)\s*(\d+)/);
  if (dateMatch) {
    const month = dateMatch[1].slice(0, 3);
    const day = dateMatch[2].padStart(2, '0');
    return `${slug}-${month}${day}`;
  }
  return slug;
}

// Find park location by name (fuzzy matching)
function findParkLocation(parkName: string) {
  // Direct match
  if (PARK_LOCATIONS[parkName]) {
    return { venue: parkName, ...PARK_LOCATIONS[parkName] };
  }

  // Try partial match
  const normalizedName = parkName.toLowerCase();
  for (const [key, value] of Object.entries(PARK_LOCATIONS)) {
    if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
      return { venue: key, ...value };
    }
  }

  // Default fallback
  return {
    venue: parkName,
    address: 'Fairfax County',
    city: 'Fairfax',
    coordinates: { lat: 38.8462, lng: -77.3064 }
  };
}

interface ScrapedEvent {
  title: string;
  date: string;
  time: string;
  ageRange: string;
  location: string;
  description: string;
}

async function fetchCalendarPage(page: number): Promise<string> {
  const url = `https://www.fairfaxcounty.gov/parks/park-events-calendar?page=${page}`;
  console.log(`Fetching page ${page}: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch page ${page}: ${response.status}`);
  }

  return response.text();
}

// Map URL path to park name
function extractParkFromUrl(url: string): string {
  const parkMap: Record<string, string> = {
    'frying-pan-park': 'Frying Pan Farm Park',
    'frying-pan-farm': 'Frying Pan Farm Park',
    'hidden-oaks': 'Hidden Oaks Nature Center',
    'green-spring': 'Green Spring Gardens',
    'burke-lake': 'Burke Lake Park',
    'lake-accotink': 'Lake Accotink Park',
    'turner-farm': 'Turner Farm',
    'riverbend': 'Riverbend Park',
    'huntley-meadows': 'Huntley Meadows Park',
    'ellanor-c-lawrence': 'Ellanor C. Lawrence Park',
    'colvin-run': 'Colvin Run Mill',
    'lake-fairfax': 'Lake Fairfax Park',
    'hidden-pond': 'Hidden Pond Nature Center',
    'sully': 'Sully Historic Site',
    'twin-lakes': 'Twin Lakes Golf Course',
    'cub-run': 'Cub Run Rec Center',
    'audrey-moore': 'Audrey Moore Rec Center',
    'franconia': 'Franconia Rec Center',
    'mount-vernon': 'Mount Vernon Rec Center',
    'oakmont': 'Oakmont Rec Center',
  };

  // Extract park slug from URL like /parks/frying-pan-park/event-name/date
  const match = url.match(/\/parks\/([^/]+)\//);
  if (match) {
    const slug = match[1];
    return parkMap[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  return 'Fairfax County Park';
}

function parseCalendarPage(html: string): ScrapedEvent[] {
  const $ = cheerio.load(html);
  const events: ScrapedEvent[] = [];

  // Parse event rows - the actual structure from Fairfax Parks
  $('div.events-list.views-row').each((_, element) => {
    const $el = $(element);

    // Get title and URL from calendar-title link
    const $titleLink = $el.find('.calendar-title a');
    const title = $titleLink.text().trim().replace(/\s*\(The event is full\)\s*/g, '');
    const eventUrl = $titleLink.attr('href') || '';

    // Get date from div.date (format: "Jan<br>19")
    const dateText = $el.find('.date').text().trim().replace(/\s+/g, ' ');

    // Get description which includes time and age (format: "10:30AM, (2-6 yrs.) Description...")
    const descriptionRaw = $el.find('.calendar-description').text().trim();

    // Parse time from description (e.g., "10:30AM,")
    const timeMatch = descriptionRaw.match(/^(\d{1,2}:\d{2}\s*(AM|PM))/i);
    const time = timeMatch ? timeMatch[1] : '10:00 AM';

    // Parse age from description (e.g., "(2-6 yrs.)" or "(4-Adult)")
    const ageMatch = descriptionRaw.match(/\(([^)]+)\)/);
    const ageRange = ageMatch ? ageMatch[1] : 'All Ages';

    // Clean description - remove time and age prefix
    let description = descriptionRaw
      .replace(/^\d{1,2}:\d{2}\s*(AM|PM),?\s*/i, '')
      .replace(/\([^)]+\)\s*/g, '')
      .trim();
    if (!description) description = title;

    // Get location from URL
    const location = extractParkFromUrl(eventUrl);

    if (title && dateText) {
      events.push({
        title,
        date: dateText,
        time,
        ageRange,
        location,
        description
      });
    }
  });

  return events;
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

function transformToEvent(scraped: ScrapedEvent, year: number): Event | null {
  const location = findParkLocation(scraped.location);
  const startDate = parseEventDate(scraped.date, scraped.time, year);

  if (!startDate) {
    console.log(`  Skipping "${scraped.title}" - could not parse date: ${scraped.date}`);
    return null;
  }

  // Estimate end date (1.5 hours after start)
  const startDateTime = new Date(startDate);
  const endDateTime = new Date(startDateTime.getTime() + 90 * 60 * 1000);

  return {
    id: generateEventId(scraped.title, scraped.date),
    title: scraped.title,
    description: scraped.description.slice(0, 500),
    type: 'one-time',
    startDate,
    endDate: endDateTime.toISOString().slice(0, 19),
    venue: location.venue,
    address: location.address,
    city: location.city,
    coordinates: location.coordinates,
    activityTypes: inferActivityTypes(scraped.title, scraped.description),
    ageRange: parseAgeRange(scraped.ageRange),
    cost: { amount: 8, per: 'person' }, // Default cost for Parks programs
    sourceUrl: 'https://www.fairfaxcounty.gov/parks/park-events-calendar',
    source: 'fairfax-parks',
    lastUpdated: new Date().toISOString().slice(0, 10)
  };
}

async function main() {
  const dataPath = path.join(__dirname, '..', 'data', 'events.json');

  console.log('=== Fairfax County Parks Event Scraper ===\n');

  // Read existing events
  console.log('Reading existing events.json...');
  const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as Event[];
  console.log(`  Found ${existingData.length} existing events`);

  // Separate Parks events from others
  const nonParksEvents = existingData.filter(e => e.source !== 'fairfax-parks');
  const existingParksEvents = existingData.filter(e => e.source === 'fairfax-parks');
  console.log(`  - ${nonParksEvents.length} events from other sources (preserved)`);
  console.log(`  - ${existingParksEvents.length} existing Parks events (will be refreshed)\n`);

  // Fetch calendar pages
  const currentYear = new Date().getFullYear();
  const allScrapedEvents: ScrapedEvent[] = [];

  for (let page = 0; page < 4; page++) {
    try {
      const html = await fetchCalendarPage(page);
      const events = parseCalendarPage(html);
      console.log(`  Page ${page}: Found ${events.length} events`);
      allScrapedEvents.push(...events);
    } catch (error) {
      console.error(`  Error fetching page ${page}:`, error);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\nTotal scraped events: ${allScrapedEvents.length}`);

  // Transform scraped events to our format
  const newParksEvents: Event[] = [];
  const seenIds = new Set<string>();

  for (const scraped of allScrapedEvents) {
    const event = transformToEvent(scraped, currentYear);
    if (event && !seenIds.has(event.id)) {
      seenIds.add(event.id);
      newParksEvents.push(event);
    }
  }

  console.log(`Transformed ${newParksEvents.length} unique events\n`);

  // Merge: keep non-Parks events + new Parks events
  const mergedEvents = [...nonParksEvents, ...newParksEvents];

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
  console.log(`Writing ${mergedEvents.length} events to events.json...`);
  fs.writeFileSync(dataPath, JSON.stringify(mergedEvents, null, 2) + '\n');

  console.log('\nDone!');
  console.log(`  - Preserved: ${nonParksEvents.length} events from other sources`);
  console.log(`  - Added/Updated: ${newParksEvents.length} Parks events`);
  console.log(`  - Total: ${mergedEvents.length} events`);
}

main().catch(console.error);
