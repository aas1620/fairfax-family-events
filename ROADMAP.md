# Fairfax Family Events - Roadmap

## Overview

4 planned enhancements to increase utility, stickiness, and community engagement:

1. **Add to Calendar** - ICS export for event planning
2. **Save Favorites** - Bookmark events for later
3. **Submit an Event** - Google Form for community contributions
4. **More Scrapers** - Library, Smithsonian, Great Country Farms

---

## 1. Add to Calendar (ICS Export)

**Goal**: One-click to add any event to iPhone/Google/Outlook calendar

**Implementation**:
- Create `lib/calendar.ts` with `generateICS(event)` function
- Add "Add to Calendar" button on `/app/events/[id]/page.tsx`
- Generate and download `.ics` file with:
  - Event title, description
  - Start/end time (or all-day for recurring)
  - Location with address
  - URL back to event page

**Files to modify**:
- `lib/calendar.ts` (new)
- `app/events/[id]/page.tsx`

---

## 2. Save Favorites

**Goal**: Heart icon to save events, view saved list

**Implementation**:
- Create `lib/favorites.ts` - localStorage get/set/toggle
- Create `components/FavoriteButton.tsx` - heart icon with filled/outline states
- Add FavoriteButton to `EventCard.tsx` and event detail page
- Add "Saved" filter option or section at top of events page
- Show badge count in Header for saved items

**Files to modify**:
- `lib/favorites.ts` (new)
- `components/FavoriteButton.tsx` (new)
- `components/EventCard.tsx`
- `app/events/[id]/page.tsx`
- `components/Header.tsx` (badge count)
- `lib/filters.ts` (add saved filter)

---

## 3. Submit an Event (Google Form)

**Goal**: Let community submit events for review

**Implementation**:
- Create Google Form with fields:
  - Event name, Description
  - Date/time (or "recurring")
  - Location (venue, address, city)
  - Cost, Age range
  - Website URL
  - Submitter email (for follow-up)
- Add "Submit an Event" link in Header and Footer
- Create simple `/submit` page with embedded form or link to form
- CTA: "Know a great family activity? Tell us about it!"

**Files to modify**:
- `app/submit/page.tsx` (new)
- `components/Header.tsx`
- `components/Footer.tsx`

---

## 4. Additional Scrapers

**Goal**: Automate Library, Smithsonian, Great Country Farms data

### 4a. Fairfax County Library
- Source: https://librarycalendar.fairfaxcounty.gov
- Events: Storytimes, STEM programs, kids activities
- Create `scripts/refresh-library.ts`

### 4b. Smithsonian
- Source: Smithsonian museum event pages or Open Access API
- Events: Free family programs at DC museums
- Create `scripts/refresh-smithsonian.ts`

### 4c. Great Country Farms
- Source: https://greatcountryfarms.com
- Events: Seasonal festivals, farm activities
- Create `scripts/refresh-farms.ts`

**Integration**:
- Add all scrapers to GitHub Action workflow
- Run weekly with Parks scraper

**Files to create**:
- `scripts/refresh-library.ts`
- `scripts/refresh-smithsonian.ts`
- `scripts/refresh-farms.ts`
- Update `.github/workflows/weekly-refresh.yml`

---

## Implementation Order

| Step | Feature | Impact |
|------|---------|--------|
| 1 | Add to Calendar | High utility |
| 2 | Save Favorites | Stickiness |
| 3 | Submit an Event | Marketability |
| 4 | Library Scraper | More content |
| 5 | Smithsonian Scraper | More content |
| 6 | Great Country Farms Scraper | More content |
