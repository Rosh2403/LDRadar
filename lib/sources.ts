export const SOURCES = [
  {
    name: "Harvard Management Company",
    url: "https://www.hmc.harvard.edu/investment-management/",
    homepageUrl: "https://www.hmc.harvard.edu/",
    type: "Endowment",
  },
  {
    name: "Yale Investments Office",
    url: "https://investments.yale.edu/",
    homepageUrl: "https://investments.yale.edu/",
    type: "Endowment",
  },
  {
    name: "GIC Singapore",
    url: "https://www.gic.com.sg/newsroom/",
    homepageUrl: "https://www.gic.com.sg/",
    type: "Sovereign Wealth Fund",
  },
  {
    name: "Temasek",
    url: "https://www.temasek.com.sg/en/news-and-resources/news-room",
    homepageUrl: "https://www.temasek.com.sg/",
    type: "Sovereign Wealth Fund",
  },
  {
    name: "NBIM Norway",
    url: "https://www.nbim.no/en/the-fund/news/",
    homepageUrl: "https://www.nbim.no/en/",
    type: "Sovereign Wealth Fund",
  },
  {
    name: "CalPERS",
    url: "https://www.calpers.ca.gov/page/newsroom",
    homepageUrl: "https://www.calpers.ca.gov/",
    type: "Pension Fund",
  },
  {
    name: "MIT Investment Management",
    url: "https://mitimco.mit.edu/",
    homepageUrl: "https://mitimco.mit.edu/",
    type: "Endowment",
  },
  {
    name: "Stanford Management Company",
    url: "https://smc.stanford.edu/",
    homepageUrl: "https://smc.stanford.edu/",
    type: "Endowment",
  },
  {
    name: "Abu Dhabi Investment Authority",
    url: "https://www.adia.ae/en/Media/News",
    homepageUrl: "https://www.adia.ae/",
    type: "Sovereign Wealth Fund",
  },
  {
    name: "SEC EDGAR 13F Filings",
    url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=13F&dateb=&owner=include&count=10",
    homepageUrl: "https://www.sec.gov/",
    type: "Regulatory",
  },
] as const;

// Direct scan prompt — used as a fallback if homepage discovery fails
export const GOAL_PROMPT = `You are scanning an institutional investor website for intelligence.
1. On the landing page, identify the 3 most recent news items, press releases, or announcements.
2. Click into each one and read the full article content — do not just skim the headline.
3. Extract findings from the full article text. Look for: leadership appointments or departures, asset allocation changes, new fund mandates or partnerships, policy or strategy shifts, notable portfolio decisions.
4. Return JSON only: {"findings":[{"title":"...","summary":"2-3 sentences with specific details from the article","category":"Leadership|Allocation|Mandate|Policy|Portfolio","date":"exact date from article","sourceUrl":"direct URL of the article page"}]}
If nothing notable found: {"findings":[]}.`;

// Discovery prompt — TinyFish starts from the homepage and finds the news section itself
export const DISCOVERY_PROMPT = `You are scanning an institutional investor's website for intelligence. You are starting from their homepage — you must navigate to find where they publish news yourself.

STEP 1 — FIND THE NEWS SECTION: Inspect the site's navigation menu and page content. Look for links labeled "News", "Newsroom", "Press Releases", "Media", "Updates", "Publications", "Announcements", "Reports", "Latest", "Insights", or similar. Click the most relevant link to navigate to the news/updates section.

STEP 2 — READ THE ARTICLES: On the news page, identify the 3 most recent articles or announcements. Click into each one and read the full article content — do not just skim headlines or intros.

STEP 3 — EXTRACT FINDINGS: From the full article text, extract intelligence. Look specifically for: leadership appointments or departures (CIO, CEO, board changes), asset allocation changes (AUM targets, PE/equity/real estate percentages), new fund mandates or external manager partnerships, policy or strategy shifts, notable portfolio company decisions or exits.

Return JSON only — no markdown, no preamble, no explanation:
{"findings":[{"title":"exact article title","summary":"2-3 sentences with specific data points from the article","category":"Leadership|Allocation|Mandate|Policy|Portfolio","date":"YYYY-MM-DD date from the article","sourceUrl":"direct URL of the article page you read"}]}
If no notable findings: {"findings":[]}.`;
