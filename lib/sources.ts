export const SOURCES = [
  {
    name: "Harvard Management Company",
    url: "https://www.hmc.harvard.edu/investment-management/",
    type: "Endowment",
  },
  {
    name: "Yale Investments Office",
    url: "https://investments.yale.edu/",
    type: "Endowment",
  },
  {
    name: "GIC Singapore",
    url: "https://www.gic.com.sg/newsroom/",
    type: "Sovereign Wealth Fund",
  },
  {
    name: "Temasek",
    url: "https://www.temasek.com.sg/en/news-and-resources/news-room",
    type: "Sovereign Wealth Fund",
  },
  {
    name: "NBIM Norway",
    url: "https://www.nbim.no/en/the-fund/news/",
    type: "Sovereign Wealth Fund",
  },
  {
    name: "CalPERS",
    url: "https://www.calpers.ca.gov/page/newsroom",
    type: "Pension Fund",
  },
  {
    name: "MIT Investment Management",
    url: "https://mitimco.mit.edu/",
    type: "Endowment",
  },
  {
    name: "Stanford Management Company",
    url: "https://smc.stanford.edu/",
    type: "Endowment",
  },
  {
    name: "Abu Dhabi Investment Authority",
    url: "https://www.adia.ae/en/Media/News",
    type: "Sovereign Wealth Fund",
  },
  {
    name: "SEC EDGAR 13F Filings",
    url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=13F&dateb=&owner=include&count=10",
    type: "Regulatory",
  },
] as const;

export const GOAL_PROMPT = `You are scanning an institutional investor website for intelligence.
1. On the landing page, identify the 3 most recent news items, press releases, or announcements.
2. Click into each one and read the full article content — do not just skim the headline.
3. Extract findings from the full article text. Look for: leadership appointments or departures, asset allocation changes, new fund mandates or partnerships, policy or strategy shifts, notable portfolio decisions.
4. Return JSON only: {"findings":[{"title":"...","summary":"2-3 sentences with specific details from the article","category":"Leadership|Allocation|Mandate|Policy|Portfolio","date":"exact date from article","sourceUrl":"direct URL of the article page"}]}
If nothing notable found: {"findings":[]}.`;
