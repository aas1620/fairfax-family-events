import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEventById, getAllEvents } from '@/lib/data';
import { ACTIVITY_LABELS, Event } from '@/lib/types';

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatCost(cost: Event['cost']): string {
  if (cost.per === 'free' || cost.amount === 0) {
    return 'Free admission';
  }
  const perLabel = cost.per === 'family' ? ' per family' : ' per person';
  return `$${cost.amount}${perLabel}`;
}

function formatAgeRange(ageRange: Event['ageRange']): string {
  if (ageRange.min === 0 && ageRange.max >= 99) {
    return 'All ages welcome';
  }
  if (ageRange.min === 0) {
    return `Best for ages up to ${ageRange.max}`;
  }
  if (ageRange.max >= 99) {
    return `Best for ages ${ageRange.min}+`;
  }
  return `Best for ages ${ageRange.min}-${ageRange.max}`;
}

function formatSchedule(event: Event): string {
  if (event.type === 'one-time' && event.startDate) {
    const date = new Date(event.startDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (event.schedule) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const openDays = event.schedule.daysOfWeek
      ? event.schedule.daysOfWeek.map((d) => days[d]).join(', ')
      : 'Daily';
    return `${openDays} ${event.schedule.hours.open} - ${event.schedule.hours.close}`;
  }

  return 'Check website for hours';
}

function getActivityIcon(activityTypes: Event['activityTypes']): string {
  if (activityTypes.includes('nature')) return '🌿';
  if (activityTypes.includes('science')) return '🔬';
  if (activityTypes.includes('physical-play')) return '⚡';
  if (activityTypes.includes('adventure')) return '🎯';
  if (activityTypes.includes('arts')) return '🎨';
  if (activityTypes.includes('history')) return '📜';
  if (activityTypes.includes('educational')) return '📚';
  if (activityTypes.includes('seasonal')) return '🍂';
  if (activityTypes.includes('music')) return '🎵';
  return '✨';
}

export async function generateStaticParams() {
  const events = getAllEvents();
  return events.map((event) => ({
    id: event.id,
  }));
}

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    return {
      title: 'Activity Not Found - Fairfax Family',
    };
  }

  return {
    title: `${event.title} - Fairfax Family`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    notFound();
  }

  const isFree = event.cost.per === 'free' || event.cost.amount === 0;

  return (
    <div className="min-h-screen bg-[#fdfcfa]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#e5dccb]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-[#8a8578] hover:text-[#5a9470] transition-colors">
              Home
            </Link>
            <svg className="w-4 h-4 text-[#d4d0c8]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <Link href="/events" className="text-[#8a8578] hover:text-[#5a9470] transition-colors">
              Activities
            </Link>
            <svg className="w-4 h-4 text-[#d4d0c8]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-[#3d3a35] font-medium truncate max-w-[200px]">{event.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image Placeholder */}
            <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-[#f7f4ee] to-[#e8f3ec] relative overflow-hidden mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-9xl opacity-30">
                  {getActivityIcon(event.activityTypes)}
                </span>
              </div>
              {isFree && (
                <span className="absolute top-4 right-4 bg-[#5a9470] text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm">
                  Free Admission
                </span>
              )}
              {event.type === 'recurring' && (
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#6b5344] text-sm font-medium px-3 py-1.5 rounded-full">
                  Open Year-Round
                </span>
              )}
            </div>

            {/* Title & Badges */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {event.activityTypes.map((type) => (
                  <span
                    key={type}
                    className="text-sm bg-[#f7f4ee] text-[#6b5344] px-3.5 py-1.5 rounded-full font-medium"
                  >
                    {ACTIVITY_LABELS[type]}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-bold text-[#3d3a35] sm:text-4xl leading-tight">
                {event.title}
              </h1>
              <p className="mt-3 text-lg text-[#8a8578] flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {event.city}, Virginia
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-[#8a8578] uppercase tracking-wider mb-3">
                About This Activity
              </h2>
              <p className="text-[#5c5850] leading-relaxed text-lg">{event.description}</p>
            </div>

            {/* Seasonal Notes */}
            {event.schedule?.seasonalNotes && (
              <div className="bg-[#f7f4ee] border border-[#e5dccb] rounded-2xl p-5 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#c4a882]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#6b5344]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#6b5344]">Seasonal Note</p>
                    <p className="text-[#8a8578] mt-1">{event.schedule.seasonalNotes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl border border-[#e5dccb] p-6 sticky top-24">
              {/* Cost */}
              <div className="mb-6 pb-6 border-b border-[#f0ebe0]">
                <h3 className="text-xs font-semibold text-[#8a8578] uppercase tracking-wider mb-2">
                  Admission
                </h3>
                <p
                  className={`text-2xl font-bold ${isFree ? 'text-[#5a9470]' : 'text-[#3d3a35]'}`}
                >
                  {formatCost(event.cost)}
                </p>
              </div>

              {/* Hours */}
              <div className="mb-6 pb-6 border-b border-[#f0ebe0]">
                <h3 className="text-xs font-semibold text-[#8a8578] uppercase tracking-wider mb-2">
                  {event.type === 'one-time' ? 'Date' : 'Hours'}
                </h3>
                <p className="text-[#3d3a35] font-medium">{formatSchedule(event)}</p>
              </div>

              {/* Ages */}
              <div className="mb-6 pb-6 border-b border-[#f0ebe0]">
                <h3 className="text-xs font-semibold text-[#8a8578] uppercase tracking-wider mb-2">
                  Recommended Ages
                </h3>
                <p className="text-[#3d3a35]">{formatAgeRange(event.ageRange)}</p>
              </div>

              {/* Address */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-[#8a8578] uppercase tracking-wider mb-2">
                  Location
                </h3>
                <p className="text-[#3d3a35] font-medium">{event.venue}</p>
                <p className="text-[#8a8578] text-sm mt-1">
                  {event.address}
                  <br />
                  {event.city}, VA
                </p>
              </div>

              {/* CTA Button */}
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#5a9470] text-white text-center py-3.5 rounded-xl font-semibold hover:bg-[#4a7d5e] transition-colors shadow-lg shadow-[#5a9470]/25"
              >
                Visit Website
              </a>

              {/* Source attribution */}
              <p className="mt-4 text-xs text-center text-[#d4d0c8]">
                Data from{' '}
                {event.source === 'fairfax-parks'
                  ? 'Fairfax County Parks'
                  : event.source === 'smithsonian'
                    ? 'Smithsonian'
                    : event.source === 'library'
                      ? 'Fairfax County Library'
                      : event.source === 'great-country-farms'
                        ? 'Great Country Farms'
                        : 'venue website'}
              </p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-12">
          <Link
            href="/events"
            className="inline-flex items-center text-[#5a9470] hover:text-[#3d6b4f] font-medium transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to all activities
          </Link>
        </div>
      </div>
    </div>
  );
}
