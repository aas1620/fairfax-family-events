/**
 * Cleanup Past Events
 *
 * Removes past one-time events from events.json and archives them
 * to data/events-archive.json. Recurring events are always kept.
 *
 * Usage: npm run cleanup
 */

import * as fs from 'fs';
import * as path from 'path';

interface Event {
  id: string;
  title: string;
  type: string;
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const EVENTS_PATH = path.join(DATA_DIR, 'events.json');
const ARCHIVE_PATH = path.join(DATA_DIR, 'events-archive.json');

const today = new Date();
today.setHours(0, 0, 0, 0);
const todayStr = today.toISOString().slice(0, 10);

// Load current events
const events: Event[] = JSON.parse(fs.readFileSync(EVENTS_PATH, 'utf-8'));

// Load existing archive (or start fresh)
let archive: Event[] = [];
if (fs.existsSync(ARCHIVE_PATH)) {
  archive = JSON.parse(fs.readFileSync(ARCHIVE_PATH, 'utf-8'));
}

const archiveIds = new Set(archive.map((e) => e.id));

const keep: Event[] = [];
const expired: Event[] = [];

for (const event of events) {
  if (event.type !== 'one-time') {
    keep.push(event);
    continue;
  }

  const endDate = event.endDate || event.startDate;
  if (!endDate || endDate.slice(0, 10) >= todayStr) {
    keep.push(event);
  } else {
    expired.push(event);
  }
}

// Append newly expired events to archive (no duplicates)
for (const event of expired) {
  if (!archiveIds.has(event.id)) {
    archive.push(event);
    archiveIds.add(event.id);
  }
}

// Write files
fs.writeFileSync(EVENTS_PATH, JSON.stringify(keep, null, 2) + '\n');
fs.writeFileSync(ARCHIVE_PATH, JSON.stringify(archive, null, 2) + '\n');

console.log(`Cleanup complete:`);
console.log(`  Kept:     ${keep.length} events`);
console.log(`  Archived: ${expired.length} newly expired`);
console.log(`  Total in archive: ${archive.length}`);
