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

export const GOAL_PROMPT = `Extract recent announcements from this page. Look for: leadership changes, allocation shifts, new mandates, policy updates, portfolio moves. Return JSON only: {"findings":[{"title":"...","summary":"1-2 sentences","category":"Leadership|Allocation|Mandate|Policy|Portfolio","date":"...","sourceUrl":"..."}]}. If nothing found: {"findings":[]}.`;
