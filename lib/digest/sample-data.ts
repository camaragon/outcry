/**
 * Sample feedback data seeded during onboarding based on product category.
 * 10 posts per category with varying vote counts and staggered timestamps
 * so the digest engine produces interesting deltas and trends.
 *
 * Each post is assigned a category name (matched to seeded categories).
 */

interface SamplePost {
  title: string;
  body: string;
  category: string;
  voteCount: number;
  /** Days ago the post was "created" (for timestamp staggering) */
  daysAgo: number;
}

interface SampleCategory {
  name: string;
  color: string;
}

interface SampleDataSet {
  categories: SampleCategory[];
  posts: SamplePost[];
}

const DEVELOPER_TOOL: SampleDataSet = {
  categories: [
    { name: "Performance", color: "#dc2626" },
    { name: "Documentation", color: "#2563eb" },
    { name: "API", color: "#7c3aed" },
    { name: "Pricing", color: "#d97706" },
  ],
  posts: [
    { title: "API response times are too slow on batch endpoints", body: "Batch requests to /api/v2/bulk take 3-5 seconds. This is blocking our CI pipeline.", category: "Performance", voteCount: 47, daysAgo: 2 },
    { title: "Add rate limit headers to all API responses", body: "We need X-RateLimit-Remaining and X-RateLimit-Reset headers to build proper retry logic.", category: "API", voteCount: 34, daysAgo: 1 },
    { title: "SDK documentation is missing TypeScript examples", body: "The Python examples are great but the TypeScript SDK docs only have JavaScript. Types would help a lot.", category: "Documentation", voteCount: 28, daysAgo: 3 },
    { title: "WebSocket connection drops after 30 minutes", body: "Our real-time dashboard loses connection silently. No reconnect event fires.", category: "Performance", voteCount: 23, daysAgo: 4 },
    { title: "Please add a GraphQL API option", body: "REST is fine but we'd love a GraphQL endpoint for more flexible queries.", category: "API", voteCount: 19, daysAgo: 1 },
    { title: "Startup plan pricing is too high for early-stage teams", body: "We're a 3-person startup and $99/mo is steep when we're pre-revenue.", category: "Pricing", voteCount: 15, daysAgo: 5 },
    { title: "Need better error messages in the SDK", body: "Getting 'Unknown error' on auth failures. Should say 'Invalid API key' or similar.", category: "Documentation", voteCount: 12, daysAgo: 2 },
    { title: "Support for ARM64 in the CLI", body: "Running on M-series Macs, the CLI works under Rosetta but native ARM would be faster.", category: "Performance", voteCount: 8, daysAgo: 6 },
    { title: "Add webhook retry with exponential backoff", body: "Failed webhooks should retry automatically instead of just logging the failure.", category: "API", voteCount: 6, daysAgo: 3 },
    { title: "Interactive API playground in the docs", body: "Like Stripe's API docs where you can try endpoints live with your test key.", category: "Documentation", voteCount: 4, daysAgo: 1 },
  ],
};

const SAAS: SampleDataSet = {
  categories: [
    { name: "Onboarding", color: "#2563eb" },
    { name: "Integrations", color: "#7c3aed" },
    { name: "Billing", color: "#d97706" },
    { name: "UX", color: "#16a34a" },
  ],
  posts: [
    { title: "Onboarding wizard is confusing for non-technical users", body: "My marketing team couldn't get through setup without asking engineering for help.", category: "Onboarding", voteCount: 42, daysAgo: 1 },
    { title: "Please add Slack integration", body: "We want notifications in our #product channel when new feedback comes in.", category: "Integrations", voteCount: 38, daysAgo: 2 },
    { title: "Can't change billing email after signup", body: "Our finance team needs invoices sent to a different email but there's no way to update it.", category: "Billing", voteCount: 31, daysAgo: 3 },
    { title: "Dashboard loads too slowly with 1000+ items", body: "After a few months of feedback, the main dashboard takes 8+ seconds to load.", category: "UX", voteCount: 27, daysAgo: 1 },
    { title: "Need Zapier integration for automations", body: "We want to auto-create Jira tickets from high-vote feedback.", category: "Integrations", voteCount: 22, daysAgo: 4 },
    { title: "The onboarding email sequence stopped after email 2", body: "I signed up a week ago and only got 2 of the 5 promised onboarding emails.", category: "Onboarding", voteCount: 16, daysAgo: 2 },
    { title: "Annual billing should offer a discount", body: "Monthly is $49 but annual is $49x12. No incentive to commit.", category: "Billing", voteCount: 11, daysAgo: 5 },
    { title: "Mobile view is almost unusable", body: "Trying to review feedback on my phone during commute — buttons are tiny and overlapping.", category: "UX", voteCount: 9, daysAgo: 3 },
    { title: "SSO support for enterprise teams", body: "We need SAML/OIDC SSO before we can roll this out company-wide.", category: "Integrations", voteCount: 7, daysAgo: 6 },
    { title: "Add a getting started video to onboarding", body: "A 2-minute video walkthrough would help way more than the text tutorial.", category: "Onboarding", voteCount: 3, daysAgo: 1 },
  ],
};

const ECOMMERCE: SampleDataSet = {
  categories: [
    { name: "Checkout", color: "#dc2626" },
    { name: "Search", color: "#2563eb" },
    { name: "Shipping", color: "#d97706" },
    { name: "Mobile", color: "#7c3aed" },
  ],
  posts: [
    { title: "Checkout flow has too many steps", body: "5 pages to buy one item. Amazon does it in 2 clicks. We're losing customers here.", category: "Checkout", voteCount: 52, daysAgo: 1 },
    { title: "Search results are irrelevant for misspellings", body: "Searching 'sneekers' returns zero results instead of showing sneakers.", category: "Search", voteCount: 39, daysAgo: 2 },
    { title: "Shipping estimates are wildly inaccurate", body: "Says 2-3 days but consistently takes 7+. Customers are complaining.", category: "Shipping", voteCount: 33, daysAgo: 3 },
    { title: "Mobile product images are too small", body: "Can't see product details on phone without zooming. Pinch-to-zoom is laggy.", category: "Mobile", voteCount: 25, daysAgo: 1 },
    { title: "Add Apple Pay to checkout", body: "Our competitors all have Apple Pay. We're losing mobile conversions.", category: "Checkout", voteCount: 21, daysAgo: 4 },
    { title: "Filter by price range on search results", body: "No way to filter products by price. Basic feature that's missing.", category: "Search", voteCount: 17, daysAgo: 2 },
    { title: "Free shipping threshold is too high", body: "$75 minimum for free shipping. Most orders are $30-50. Nobody hits it.", category: "Shipping", voteCount: 13, daysAgo: 5 },
    { title: "Cart abandonment emails come too late", body: "I get the reminder 3 days later. By then I already bought it elsewhere.", category: "Checkout", voteCount: 8, daysAgo: 3 },
    { title: "Mobile app crashes on product pages with video", body: "Any product with a video review crashes the app on Android.", category: "Mobile", voteCount: 5, daysAgo: 6 },
    { title: "Search autocomplete is slow on mobile", body: "Takes 2-3 seconds for suggestions to appear. Desktop is instant.", category: "Search", voteCount: 3, daysAgo: 1 },
  ],
};

const MOBILE_APP: SampleDataSet = {
  categories: [
    { name: "Crashes", color: "#dc2626" },
    { name: "UX", color: "#2563eb" },
    { name: "Features", color: "#16a34a" },
    { name: "Performance", color: "#d97706" },
  ],
  posts: [
    { title: "App crashes when switching between tabs quickly", body: "Reproducible: open 3 tabs, switch rapidly between them. Crash within 10 seconds.", category: "Crashes", voteCount: 45, daysAgo: 1 },
    { title: "Dark mode doesn't apply to all screens", body: "Settings and profile screens are still bright white in dark mode. Hurts at night.", category: "UX", voteCount: 37, daysAgo: 2 },
    { title: "Add offline mode for viewing saved items", body: "When I'm on the subway with no signal, I can't access anything I've saved.", category: "Features", voteCount: 29, daysAgo: 3 },
    { title: "Battery drain is excessive in background", body: "App uses 30% of my battery even when I'm not using it. Location services maybe?", category: "Performance", voteCount: 24, daysAgo: 1 },
    { title: "Crash on uploading photos larger than 10MB", body: "iPhone 15 Pro photos are 12MB+ by default. App crashes every time I try to upload.", category: "Crashes", voteCount: 20, daysAgo: 4 },
    { title: "Swipe gestures feel laggy compared to competitors", body: "There's a noticeable delay on swipe-to-dismiss. Makes the app feel cheap.", category: "UX", voteCount: 14, daysAgo: 2 },
    { title: "Please add widget support for iOS", body: "Would love a home screen widget showing my daily summary.", category: "Features", voteCount: 10, daysAgo: 5 },
    { title: "App takes 6 seconds to cold start", body: "Every other app opens instantly. This one shows a splash screen for way too long.", category: "Performance", voteCount: 8, daysAgo: 3 },
    { title: "Push notifications don't deep link correctly", body: "Tapping a notification opens the app to the home screen, not the relevant content.", category: "UX", voteCount: 5, daysAgo: 6 },
    { title: "Add Face ID / biometric login", body: "Typing my password every time is annoying. Every banking app has Face ID.", category: "Features", voteCount: 3, daysAgo: 1 },
  ],
};

// Generic fallback for "other"
const OTHER: SampleDataSet = {
  categories: [
    { name: "Feature Request", color: "#2563eb" },
    { name: "Bug Report", color: "#dc2626" },
    { name: "UX Improvement", color: "#16a34a" },
    { name: "Documentation", color: "#d97706" },
  ],
  posts: [
    { title: "Add dark mode support", body: "Dark mode would be much easier on the eyes for long sessions.", category: "Feature Request", voteCount: 41, daysAgo: 1 },
    { title: "Login page shows error after session timeout", body: "If I leave it open for an hour, I get a confusing error instead of being redirected to login.", category: "Bug Report", voteCount: 35, daysAgo: 2 },
    { title: "Navigation is confusing for new users", body: "Took me 10 minutes to find the settings page. Should be in the sidebar, not buried in a menu.", category: "UX Improvement", voteCount: 28, daysAgo: 3 },
    { title: "Export data to CSV", body: "Need to pull our data into spreadsheets for quarterly reviews.", category: "Feature Request", voteCount: 22, daysAgo: 1 },
    { title: "Page crashes when uploading large files", body: "Anything over 25MB causes the page to freeze and eventually crash.", category: "Bug Report", voteCount: 18, daysAgo: 4 },
    { title: "Keyboard shortcuts would save so much time", body: "Power users need keyboard shortcuts for common actions.", category: "Feature Request", voteCount: 14, daysAgo: 2 },
    { title: "Getting started guide is outdated", body: "Screenshots in the docs don't match the current UI. Very confusing for new users.", category: "Documentation", voteCount: 10, daysAgo: 5 },
    { title: "Search is too slow with lots of data", body: "After 6 months of use, search takes 5+ seconds to return results.", category: "UX Improvement", voteCount: 7, daysAgo: 3 },
    { title: "Mobile responsive layout is broken", body: "Half the UI is cut off on my phone. Tables overflow the screen.", category: "Bug Report", voteCount: 4, daysAgo: 6 },
    { title: "Add API documentation", body: "We want to build integrations but there's no API docs anywhere.", category: "Documentation", voteCount: 2, daysAgo: 1 },
  ],
};

export function getSampleData(
  productCategory: string,
): SampleDataSet {
  switch (productCategory) {
    case "DEVELOPER_TOOL":
      return DEVELOPER_TOOL;
    case "SAAS":
      return SAAS;
    case "ECOMMERCE":
      return ECOMMERCE;
    case "MOBILE_APP":
      return MOBILE_APP;
    default:
      return OTHER;
  }
}
