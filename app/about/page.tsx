import Link from 'next/link';

export const metadata = {
  title: 'About - Fairfax Family Fun',
  description:
    'Learn about Fairfax Family Fun, your guide to weekend activities for families in Fairfax County, Virginia.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-indigo-600">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900">About</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          About Fairfax Family Fun
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-6">
            Fairfax Family Fun is your guide to discovering family-friendly
            activities, events, and venues across Fairfax County and the
            surrounding Northern Virginia area.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            We know how challenging it can be to find the perfect weekend
            activity for your family. Our goal is to make it easy to discover
            new adventures, from free parks and playgrounds to exciting
            attractions and seasonal events.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            What We Cover
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>Indoor play centers and trampoline parks</li>
            <li>Museums and educational venues</li>
            <li>Parks, playgrounds, and nature centers</li>
            <li>Farms and seasonal attractions</li>
            <li>Arts and cultural events</li>
            <li>Sports and recreation facilities</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Data Sources
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Our listings are compiled from various sources including:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>Fairfax County Parks & Recreation</li>
            <li>Smithsonian Institution</li>
            <li>Local venue websites</li>
            <li>Community contributions</li>
          </ul>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-8">
            <h3 className="font-semibold text-amber-800 mb-2">
              Always Verify Before Visiting
            </h3>
            <p className="text-amber-700">
              While we strive to keep our information accurate, hours, prices,
              and availability can change. We recommend always confirming
              details directly with venues before your visit.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Contact Us
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Have a suggestion for a venue we should add? Found an error in our
            listings? We would love to hear from you. This is a community resource
            and your feedback helps make it better for everyone.
          </p>
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
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
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
