# Fairfax Family Events

A family-friendly event aggregator for Fairfax County, Virginia. The site scrapes events from multiple local sources (county parks, libraries, museums, farms) and presents them in a filterable, searchable interface. Built to help parents find activities for kids without having to check a dozen different websites.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Scraping**: Cheerio (HTML parsing), Playwright (JS-rendered pages)
- **Deployment**: Vercel (auto-deploys from main branch)
- **CI/CD**: GitHub Actions (daily scraper runs at 6am ET)

## Data Sources

All events stored in `data/events.json` with a `source` field.

| Source | Scraper | Status | Command |
|--------|---------|--------|---------|
| Fairfax County Parks | `refresh-parks.ts` | Working | `npm run refresh-parks` |
| Fairfax County Library | `refresh-library.ts` | Working | `npm run refresh-library` |
| Great Country Farms | `refresh-great-country-farms.ts` | Working (not in CI) | `npm run refresh-gcf` |
| Udvar-Hazy Center | `refresh-udvar-hazy.ts` | Working (not in CI) | `npm run refresh-udvar-hazy` |
| Manual entries | N/A | Manual | Edit `events.json` directly |

**Current event counts** (~115 total):
- fairfax-parks: ~77 events
- library: ~20 events
- manual: ~10 events
- great-country-farms: ~6 events
- smithsonian: ~2 events

## Running Scrapers

```bash
# Run individual scrapers
npm run refresh-parks       # Fairfax County Parks calendar
npm run refresh-library     # Library RSS feed (today's events only)
npm run refresh-gcf         # Great Country Farms
npm run refresh-udvar-hazy  # Smithsonian Udvar-Hazy Center

# Scrapers preserve events from other sources - safe to run individually
```

**Note**: The library RSS feed only returns "today's" events, so it needs to run daily to accumulate events. Parks scraper gets ~2 weeks ahead.

## Local Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # Run ESLint
```

## Project Structure

```
app/
  page.tsx              # Homepage
  events/
    page.tsx            # Event listing with filters
    [id]/page.tsx       # Event detail page
  about/page.tsx        # About page
components/             # React components (EventCard, Header, etc.)
lib/                    # Utilities (filters, data loading)
data/
  events.json           # All event data (auto-updated by scrapers)
scripts/
  refresh-*.ts          # Scraper scripts
.github/workflows/
  weekly-refresh.yml    # Daily GitHub Action (runs parks + library)
```

## Current State

**Done**:
- Core site with event listing, filtering, detail pages
- Parks and Library scrapers running daily via GitHub Actions
- Great Country Farms and Udvar-Hazy scrapers (manual runs)
- Canceled event filtering for library events

**In Progress / Next** (see ROADMAP.md):
- Add to Calendar (ICS export)
- Save Favorites (localStorage)
- Submit an Event form
- Add GCF and Udvar-Hazy scrapers to daily CI

## Gotchas

1. **Library RSS is daily only**: The LibCal RSS feed at `librarycalendar.fairfaxcounty.gov/rss.php?cid=6524` only returns events for the current day. Must run daily to build up future events.

2. **Build error on /events page**: There's a pre-existing React context error (`useSavedEvents must be used within a SavedEventsProvider`) that fails the build. The Providers component exists but may not be wired up correctly.

3. **Scrapers preserve other sources**: Each scraper filters by its own `source` field and preserves all other events. Safe to run any scraper without losing data from other sources.

4. **Event IDs are deterministic**: IDs are generated from title + date + location, so the same event won't be duplicated if scraped multiple times.

5. **Canceled events**: Library events with "canceled" or "cancelled" in the title are now filtered out automatically.

6. **Coordinates matter**: Events have lat/lng coordinates for potential future map features. Each scraper has hardcoded location data for known venues.

7. **Uncommitted local changes**: There are several uncommitted files (HeroSection, Providers, QuickPicks, etc.) that may be work-in-progress features.
