/**
 * Fairfax County Library Event Bulk Scraper (Playwright)
 *
 * One-time script to seed events.json with 2-4 weeks of library events.
 * Uses Playwright headless browser to scrape the LibCal calendar with JS rendering.
 *
 * Prerequisites:
 *   npm install -D playwright
 *   npx playwright install chromium
 *
 * Usage: npm run seed-library
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// Library branch locations (23 branches)
const LIBRARY_LOCATIONS: Record<string, { address: string; city: string; coordinates: { lat: number; lng: number } }> = {
  'Burke Centre Library': { address: '5935 Freds Oak Rd', city: 'Burke', coordinates: { lat: 38.7934, lng: -77.2892 } },
  'Centreville Regional Library': { address: '14200 St Germain Dr', city: 'Centreville', coordinates: { lat: 38.8406, lng: -77.4289 } },
  'Chantilly Regional Library': { address: '4000 Stringfellow Rd', city: 'Chantilly', coordinates: { lat: 38.8953, lng: -77.4311 } },
  'City of Fairfax Regional Library': { address: '10360 North St', city: 'Fairfax', coordinates: { lat: 38.8462, lng: -77.3064 } },
  'Dolley Madison Library': { address: '1244 Oak Ridge Ave', city: 'McLean', coordinates: { lat: 38.9339, lng: -77.1772 } },
  'Fairfax County Public Library': { address: '12000 Government Center Pkwy', city: 'Fairfax', coordinates: { lat: 38.8533, lng: -77.3561 } },
  'George Mason Regional Library': { address: '7001 Little River Tpke', city: 'Annandale', coordinates: { lat: 38.8303, lng: -77.2133 } },
  'Great Falls Library': { address: '9830 Georgetown Pike', city: 'Great Falls', coordinates: { lat: 38.9817, lng: -77.2881 } },
  'Herndon Fortnightly Library': { address: '768 Center St', city: 'Herndon', coordinates: { lat: 38.9697, lng: -77.3856 } },
  'John Marshall Library': { address: '6209 Rose Hill Dr', city: 'Alexandria', coordinates: { lat: 38.7683, lng: -77.1022 } },
  'Kings Park Library': { address: '9000 Burke Lake Rd', city: 'Burke', coordinates: { lat: 38.8061, lng: -77.2803 } },
  'Kingstowne Library': { address: '6500 Landsdowne Centre', city: 'Alexandria', coordinates: { lat: 38.7656, lng: -77.1336 } },
  'Lorton Library': { address: '9520 Richmond Hwy', city: 'Lorton', coordinates: { lat: 38.7042, lng: -77.0922 } },
  'Martha Washington Library': { address: '6614 Fort Hunt Rd', city: 'Alexandria', coordinates: { lat: 38.7342, lng: -77.0578 } },
  'Oakton Library': { address: '10304 Lynnhaven Pl', city: 'Oakton', coordinates: { lat: 38.8867, lng: -77.3006 } },
  'Patrick Henry Library': { address: '101 Maple Ave E', city: 'Vienna', coordinates: { lat: 38.9017, lng: -77.2639 } },
  'Pohick Regional Library': { address: '6450 Sydenstricker Rd', city: 'Burke', coordinates: { lat: 38.7511, lng: -77.2717 } },
  'Reston Regional Library': { address: '11925 Bowman Towne Dr', city: 'Reston', coordinates: { lat: 38.9592, lng: -77.3522 } },
  'Richard Byrd Library': { address: '7250 Commerce St', city: 'Springfield', coordinates: { lat: 38.7736, lng: -77.1806 } },
  'Sherwood Regional Library': { address: '2501 Sherwood Hall Ln', city: 'Alexandria', coordinates: { lat: 38.7483, lng: -77.0736 } },
  'Thomas Jefferson Library': { address: '7415 Arlington Blvd', city: 'Falls Church', coordinates: { lat: 38.8658, lng: -77.1911 } },
  'Tysons-Pimmit Regional Library': { address: '7584 Leesburg Pike', city: 'Falls Church', coordinates: { lat: 38.9044, lng: -77.2069 } },
  'Woodrow Wilson Library': { address: '6101 Knollwood Dr', city: 'Falls Church', coordinates: { lat: 38.8722, lng: -77.1642 } },
};

// Parse library audience to age range
function parseLibraryAudience(audience: string): { min: number; max: number } {
  const lower = audience.toLowerCase();

  if (/babies|infant/i.test(lower)) return { min: 0, max: 2 };
  if (/toddler/i.test(lower)) return { min: 1, max: 3 };
  if (/babies.*toddler|toddler.*babies/i.test(lower)) return { min: 0, max: 3 };
  if (/preschool/i.test(lower)) return { min: 3, max: 5 };
  if (/school.?age|children|kids/i.test(lower)) return { min: 5, max: 12 };
  if (/teen/i.test(lower)) return { min: 13, max: 18 };
  if (/famil/i.test(lower)) return { min: 0, max: 99 };
  if (/all ages?/i.test(lower)) return { min: 0, max: 99 };

  return { min: 0, max: 99 };
}

// Map library category to activity types
function mapLibraryCategory(category: string, title: string): string[] {
  const text = `${category} ${title}`.toLowerCase();
  const types: string[] = [];

  if (/storytime|story|reading|book/i.test(text)) types.push('educational');
  if (/steam|stem|science|robot|coding|tech|experiment/i.test(text)) types.push('science');
  if (/art|craft|make.*create|creative|draw|paint/i.test(text)) types.push('arts');
  if (/music|movement|dance|sing|rhyme/i.test(text)) types.push('music');
  if (/game|play|outdoor|active/i.test(text)) types.push('physical-play');
  if (/nature|animal|garden|bug|bird/i.test(text)) types.push('nature');
  if (/history|heritage/i.test(text)) types.push('history');

  // Default to educational for library events
  if (types.length === 0) types.push('educational');

  return types;
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

// Find library location by name (fuzzy matching)
function findLibraryLocation(campusName: string) {
  // Direct match
  if (LIBRARY_LOCATIONS[campusName]) {
    return { venue: campusName, ...LIBRARY_LOCATIONS[campusName] };
  }

  // Try partial match
  const normalizedName = campusName.toLowerCase();
  for (const [key, value] of Object.entries(LIBRARY_LOCATIONS)) {
    if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
      return { venue: key, ...value };
    }
  }

  // Try matching just the branch name
  for (const [key, value] of Object.entries(LIBRARY_LOCATIONS)) {
    const simplifiedKey = key.replace(' Library', '').replace(' Regional', '').toLowerCase();
    if (normalizedName.includes(simplifiedKey) || simplifiedKey.includes(normalizedName)) {
      return { venue: key, ...value };
    }
  }

  // Default fallback
  return {
    venue: campusName || 'Fairfax County Library',
    address: 'Fairfax County',
    city: 'Fairfax',
    coordinates: { lat: 38.8462, lng: -77.3064 }
  };
}

// Generate unique event ID
function generateEventId(title: string, date: string, campus: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 25);

  const campusSlug = (campus || 'library')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 10);

  // Date format should be YYYYMMDD
  const dateSlug = date.replace(/-/g, '');

  return `lib-${slug}-${campusSlug}-${dateSlug}`;
}

// Parse date string like "January 20, 2026" to YYYY-MM-DD
function parseDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    // Try parsing "Mon, Jan 20" format
    const match = dateStr.match(/(\w+),?\s*(\w+)\s+(\d+)/);
    if (match) {
      const months: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const month = months[match[2].toLowerCase().slice(0, 3)];
      const day = parseInt(match[3]);
      const year = new Date().getFullYear();
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

// Parse time string like "10:00am" or "2:30 PM" to HH:mm
function parseTime(timeStr: string): string {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (!match) return '10:00';

  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3]?.toLowerCase();

  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

interface ScrapedEvent {
  title: string;
  url: string;
  date: string;
  startTime: string;
  endTime: string;
  campus: string;
  location: string;
  audience: string;
  category: string;
  description: string;
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

function transformToEvent(scraped: ScrapedEvent): Event {
  const location = findLibraryLocation(scraped.campus);

  // Build start/end date-time strings
  const startDate = `${scraped.date}T${scraped.startTime || '10:00'}:00`;
  const endTime = scraped.endTime || `${(parseInt(scraped.startTime?.split(':')[0] || '10') + 1).toString().padStart(2, '0')}:${scraped.startTime?.split(':')[1] || '00'}`;
  const endDate = `${scraped.date}T${endTime}:00`;

  // Build description
  let description = scraped.description || scraped.title;
  if (scraped.location && !description.includes(scraped.location)) {
    description = `${scraped.location}. ${description}`;
  }

  const activityTypes = mapLibraryCategory(scraped.category, scraped.title);

  return {
    id: generateEventId(scraped.title, scraped.date, scraped.campus),
    title: scraped.title,
    description: description.slice(0, 500),
    type: 'one-time',
    startDate,
    endDate,
    venue: location.venue,
    address: location.address,
    city: location.city,
    coordinates: location.coordinates,
    activityTypes,
    ageRange: parseLibraryAudience(scraped.audience),
    cost: { amount: 0, per: 'free' }, // Library events are free
    exhaustionRating: inferExhaustionRating(activityTypes),
    sourceUrl: scraped.url,
    source: 'library',
    lastUpdated: new Date().toISOString().slice(0, 10)
  };
}

async function main() {
  const dataPath = path.join(__dirname, '..', 'data', 'events.json');

  console.log('=== Fairfax County Library Bulk Scraper (Playwright) ===\n');

  // Read existing events
  console.log('Reading existing events.json...');
  const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as Event[];
  console.log(`  Found ${existingData.length} existing events`);

  // Separate library events from others
  const nonLibraryEvents = existingData.filter(e => e.source !== 'library');
  console.log(`  - ${nonLibraryEvents.length} events from other sources (preserved)\n`);

  // Launch browser
  console.log('Launching headless browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Family audience filter IDs:
  // 2180 = Babies, 2183 = Preschoolers, 2184 = School Age Children, 2185 = Families
  // 2181 = Toddlers
  const calendarUrl = 'https://librarycalendar.fairfaxcounty.gov/calendar/events?cid=6524&t=d&d=0000-00-00&cal=6524&audience=2180,2181,2183,2184,2185';

  console.log(`Navigating to: ${calendarUrl}`);
  await page.goto(calendarUrl, { waitUntil: 'networkidle' });

  // Wait for events to load
  console.log('Waiting for events to load...');
  try {
    await page.waitForSelector('.s-lc-ea-item, .fc-event, .s-lc-event', { timeout: 15000 });
  } catch {
    console.log('No event selector found, trying alternative approach...');
  }

  // Click "Load More" button repeatedly to get more events
  let loadMoreClicks = 0;
  const maxClicks = 10; // Limit to prevent infinite loops

  while (loadMoreClicks < maxClicks) {
    const loadMoreButton = await page.$('.s-lc-ea-more, button:has-text("Load More"), .load-more');
    if (!loadMoreButton) break;

    try {
      console.log(`Clicking "Load More" (${loadMoreClicks + 1})...`);
      await loadMoreButton.click();
      await page.waitForTimeout(1500);
      loadMoreClicks++;
    } catch {
      break;
    }
  }

  console.log(`Loaded ${loadMoreClicks} additional pages of events\n`);

  // Extract event data from the page
  console.log('Extracting event data...');

  const scrapedEvents: ScrapedEvent[] = await page.evaluate(() => {
    const events: ScrapedEvent[] = [];

    // Try multiple selectors that LibCal might use
    const eventElements = document.querySelectorAll('.s-lc-ea-item, .fc-event, .s-lc-event, [data-event-id], .event-item');

    eventElements.forEach((el) => {
      // Try to extract event information
      const titleEl = el.querySelector('.s-lc-ea-title, .fc-title, .event-title, h3, h4, a');
      const title = titleEl?.textContent?.trim() || '';

      const linkEl = el.querySelector('a[href*="event"], a.s-lc-ea-title');
      const url = linkEl?.getAttribute('href') || '';

      const dateEl = el.querySelector('.s-lc-ea-date, .fc-date, .event-date, [data-date]');
      const date = dateEl?.textContent?.trim() || dateEl?.getAttribute('data-date') || '';

      const timeEl = el.querySelector('.s-lc-ea-time, .fc-time, .event-time');
      const timeText = timeEl?.textContent?.trim() || '';

      const campusEl = el.querySelector('.s-lc-ea-loc, .s-lc-ea-campus, .event-location, .campus');
      const campus = campusEl?.textContent?.trim() || '';

      const locationEl = el.querySelector('.s-lc-ea-room, .room');
      const location = locationEl?.textContent?.trim() || '';

      const audienceEl = el.querySelector('.s-lc-ea-audience, .audience, [data-audience]');
      const audience = audienceEl?.textContent?.trim() || audienceEl?.getAttribute('data-audience') || '';

      const categoryEl = el.querySelector('.s-lc-ea-category, .category, [data-category]');
      const category = categoryEl?.textContent?.trim() || categoryEl?.getAttribute('data-category') || '';

      const descEl = el.querySelector('.s-lc-ea-desc, .event-description, .description');
      const description = descEl?.textContent?.trim() || '';

      if (title) {
        // Parse time range like "10:00am - 11:00am"
        const timeParts = timeText.split(/\s*[-–]\s*/);
        const startTime = timeParts[0] || '';
        const endTime = timeParts[1] || '';

        events.push({
          title,
          url: url.startsWith('http') ? url : (url ? `https://librarycalendar.fairfaxcounty.gov${url}` : ''),
          date,
          startTime,
          endTime,
          campus,
          location,
          audience,
          category,
          description
        });
      }
    });

    return events;
  });

  console.log(`Extracted ${scrapedEvents.length} events from page\n`);

  await browser.close();

  // Transform and deduplicate events
  const newLibraryEvents: Event[] = [];
  const seenIds = new Set<string>();

  for (const scraped of scrapedEvents) {
    // Parse the date
    const parsedDate = parseDate(scraped.date);
    const parsedStartTime = parseTime(scraped.startTime);
    const parsedEndTime = parseTime(scraped.endTime);

    const normalizedScraped: ScrapedEvent = {
      ...scraped,
      date: parsedDate,
      startTime: parsedStartTime,
      endTime: parsedEndTime
    };

    const event = transformToEvent(normalizedScraped);

    // Skip events in the past
    if (event.startDate && event.startDate < new Date().toISOString().slice(0, 10)) {
      continue;
    }

    if (!seenIds.has(event.id)) {
      seenIds.add(event.id);
      newLibraryEvents.push(event);
    }
  }

  console.log(`Transformed ${newLibraryEvents.length} unique future events`);

  // Merge: keep non-library events + new library events
  const mergedEvents = [...nonLibraryEvents, ...newLibraryEvents];

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
  console.log(`  - Preserved: ${nonLibraryEvents.length} events from other sources`);
  console.log(`  - Added: ${newLibraryEvents.length} Library events`);
  console.log(`  - Total: ${mergedEvents.length} events`);
}

main().catch(console.error);
