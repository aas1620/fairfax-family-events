/**
 * Fairfax County Library Event Scraper
 *
 * Fetches events from the LibCal RSS feed and updates events.json.
 * Preserves events from other sources.
 *
 * RSS Feed: https://librarycalendar.fairfaxcounty.gov/rss.php?cid=6524
 * Note: RSS feed returns "today's" events only (~60/day), so this runs daily.
 *
 * Usage: npm run refresh-library
 */

import * as cheerio from 'cheerio';
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

// Family-friendly audience keywords
const FAMILY_AUDIENCES = [
  'babies',
  'baby',
  'infant',
  'toddler',
  'preschool',
  'school age',
  'children',
  'kids',
  'family',
  'families',
];

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
function mapLibraryCategory(category: string): string[] {
  const lower = category.toLowerCase();
  const types: string[] = [];

  if (/storytime|story|reading|book/i.test(lower)) types.push('educational');
  if (/steam|stem|science|robot|coding|tech/i.test(lower)) types.push('science');
  if (/art|craft|make.*create|creative/i.test(lower)) types.push('arts');
  if (/music|movement|dance|sing/i.test(lower)) types.push('music');
  if (/game|play|outdoor/i.test(lower)) types.push('physical-play');
  if (/nature|animal|garden/i.test(lower)) types.push('nature');
  if (/history|heritage/i.test(lower)) types.push('history');

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

  // Try matching just the branch name (e.g., "Burke Centre" -> "Burke Centre Library")
  for (const [key, value] of Object.entries(LIBRARY_LOCATIONS)) {
    const simplifiedKey = key.replace(' Library', '').replace(' Regional', '').toLowerCase();
    if (normalizedName.includes(simplifiedKey) || simplifiedKey.includes(normalizedName)) {
      return { venue: key, ...value };
    }
  }

  // Default fallback
  return {
    venue: campusName,
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

  const campusSlug = campus
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 10);

  // Format: library-{slug}-{campus}-{date}
  return `lib-${slug}-${campusSlug}-${date.replace(/-/g, '')}`;
}

// Strip HTML tags from description
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if audience matches family-friendly criteria
function isFamilyEvent(audience: string): boolean {
  const lower = audience.toLowerCase();
  return FAMILY_AUDIENCES.some(keyword => lower.includes(keyword));
}

// Check if event is canceled
function isCanceledEvent(title: string): boolean {
  return /cancel+ed/i.test(title);
}

interface RssEvent {
  title: string;
  link: string;
  description: string;
  date: string;      // YYYY-MM-DD from libcal:date
  startTime: string; // HH:mm from libcal:start
  endTime: string;   // HH:mm from libcal:end
  campus: string;    // libcal:campus
  location: string;  // libcal:location (room)
  audience: string;  // libcal:audience
  category: string;  // category
  registrationRequired: boolean;
}

async function fetchRssFeed(): Promise<string> {
  const url = 'https://librarycalendar.fairfaxcounty.gov/rss.php?cid=6524';
  console.log(`Fetching RSS feed: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.status}`);
  }

  return response.text();
}

function parseRssFeed(xml: string): RssEvent[] {
  const $ = cheerio.load(xml, { xml: true });
  const events: RssEvent[] = [];

  $('item').each((_, element) => {
    const $el = $(element);

    const title = $el.find('title').text().trim();
    const link = $el.find('link').text().trim();
    const description = $el.find('description').text().trim();
    const date = $el.find('libcal\\:date, date').text().trim();
    const startTime = $el.find('libcal\\:start, start').text().trim();
    const endTime = $el.find('libcal\\:end, end').text().trim();
    const campus = $el.find('libcal\\:campus, campus').text().trim();
    const location = $el.find('libcal\\:location, location').text().trim();
    const audience = $el.find('libcal\\:audience, audience').text().trim();
    const category = $el.find('category').text().trim();
    const registrations = $el.find('libcal\\:registrations, registrations').text().trim();

    if (title && date) {
      events.push({
        title,
        link,
        description: stripHtml(description),
        date,
        startTime,
        endTime,
        campus,
        location,
        audience,
        category,
        registrationRequired: registrations === 'true'
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

// Normalize time to HH:mm format
function normalizeTime(time: string): string {
  if (!time) return '10:00';
  // Remove seconds if present (e.g., "10:00:00" -> "10:00")
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    return `${match[1].padStart(2, '0')}:${match[2]}`;
  }
  return '10:00';
}

// Clean description - remove redundant time/location prefixes
function cleanDescription(desc: string): string {
  return desc
    .replace(/^Time:\s*[\d:apm\s-]+/i, '')
    .replace(/Location:\s*Location:\s*/gi, '')
    .replace(/Location:\s*/gi, '')
    .trim();
}

function transformToEvent(rss: RssEvent): Event {
  const location = findLibraryLocation(rss.campus);

  // Normalize times
  const startTime = normalizeTime(rss.startTime);
  const endTime = rss.endTime
    ? normalizeTime(rss.endTime)
    : `${(parseInt(startTime.split(':')[0]) + 1).toString().padStart(2, '0')}:${startTime.split(':')[1]}`;

  // Build start/end date-time strings (ISO format without seconds for cleaner display)
  const startDate = `${rss.date}T${startTime}`;
  const endDate = `${rss.date}T${endTime}`;

  // Build description - clean it first
  let description = cleanDescription(rss.description);
  if (rss.location && !description.toLowerCase().includes(rss.location.toLowerCase())) {
    description = `${rss.location}. ${description}`;
  }
  if (rss.registrationRequired) {
    description = `Registration required. ${description}`;
  }

  const activityTypes = mapLibraryCategory(rss.category || rss.title);

  return {
    id: generateEventId(rss.title, rss.date, rss.campus),
    title: rss.title,
    description: description.slice(0, 500),
    type: 'one-time',
    startDate,
    endDate,
    venue: location.venue,
    address: location.address,
    city: location.city,
    coordinates: location.coordinates,
    activityTypes,
    ageRange: parseLibraryAudience(rss.audience),
    cost: { amount: 0, per: 'free' }, // Library events are free
    exhaustionRating: inferExhaustionRating(activityTypes),
    sourceUrl: rss.link,
    source: 'library',
    lastUpdated: new Date().toISOString().slice(0, 10)
  };
}

async function main() {
  const dataPath = path.join(__dirname, '..', 'data', 'events.json');

  console.log('=== Fairfax County Library Event Scraper ===\n');

  // Read existing events
  console.log('Reading existing events.json...');
  const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as Event[];
  console.log(`  Found ${existingData.length} existing events`);

  // Separate library events from others
  const nonLibraryEvents = existingData.filter(e => e.source !== 'library');
  const existingLibraryEvents = existingData.filter(e => e.source === 'library');
  console.log(`  - ${nonLibraryEvents.length} events from other sources (preserved)`);
  console.log(`  - ${existingLibraryEvents.length} existing Library events\n`);

  // Fetch and parse RSS feed
  let rssEvents: RssEvent[] = [];
  try {
    const xml = await fetchRssFeed();
    rssEvents = parseRssFeed(xml);
    console.log(`Parsed ${rssEvents.length} events from RSS feed`);
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return;
  }

  // Filter for family-friendly events
  const familyEvents = rssEvents.filter(e => isFamilyEvent(e.audience));
  console.log(`Filtered to ${familyEvents.length} family/kids events\n`);

  // Transform to Event format
  const newLibraryEvents: Event[] = [];
  const seenIds = new Set<string>();

  // Keep existing library events that aren't duplicates
  for (const event of existingLibraryEvents) {
    if (!seenIds.has(event.id)) {
      seenIds.add(event.id);
      // Keep if event hasn't passed yet
      if (event.startDate && event.startDate >= new Date().toISOString().slice(0, 10)) {
        newLibraryEvents.push(event);
      }
    }
  }
  console.log(`Retained ${newLibraryEvents.length} existing future Library events`);

  // Add new events from RSS
  let addedCount = 0;
  for (const rss of familyEvents) {
    // Skip canceled events
    if (isCanceledEvent(rss.title)) {
      console.log(`  Skipping canceled event: ${rss.title}`);
      continue;
    }
    const event = transformToEvent(rss);
    if (!seenIds.has(event.id)) {
      seenIds.add(event.id);
      newLibraryEvents.push(event);
      addedCount++;
    }
  }
  console.log(`Added ${addedCount} new events from today's RSS feed`);

  // Merge: keep non-library events + updated library events
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
  console.log(`  - Library events: ${newLibraryEvents.length} total`);
  console.log(`  - Total: ${mergedEvents.length} events`);
}

main().catch(console.error);
