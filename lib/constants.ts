// Bloomberg Terminal inspired color palette
// Background: deep black, Text: amber/orange primary, white secondary
export const THEME = {
  bg: "#000000",
  card: "#0a0a0a",
  border: "#1a1a1a",
  text: "#ff8c00",        // Bloomberg amber/orange
  textSecondary: "#e0e0e0", // white-ish for secondary text
  muted: "#666666",
  accent: "#ff6600",       // Bloomberg orange
  positive: "#00c853",     // green for success/positive
  negative: "#ff1744",     // red for errors/negative
  warning: "#ffab00",      // amber for warnings
  link: "#4fc3f7",         // light blue for links
} as const;

// Type badge colors (Bloomberg-style: muted but distinct)
export const TYPE_COLORS: Record<string, string> = {
  Endowment: "#4fc3f7",            // cyan
  "Sovereign Wealth Fund": "#00c853", // green
  "Pension Fund": "#ff6600",        // orange
  Regulatory: "#ce93d8",           // purple
  Other: "#666666",
};

// Category badge colors
export const CATEGORY_COLORS: Record<string, string> = {
  Leadership: "#ff1744",    // red
  Allocation: "#4fc3f7",    // cyan
  Mandate: "#00c853",       // green
  Policy: "#ffab00",        // amber
  Portfolio: "#ce93d8",     // purple
};

// Lists for filter UI
export const CATEGORIES = ["Leadership", "Allocation", "Mandate", "Policy", "Portfolio"] as const;
export const TYPES = ["Endowment", "Sovereign Wealth Fund", "Pension Fund", "Regulatory"] as const;
export const SOURCE_TYPES = ["Endowment", "Sovereign Wealth Fund", "Pension Fund", "Regulatory", "Other"] as const;

// Shared utilities
export function formatDate(iso: string | null): string {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// SSRF protection — block internal/private IPs
const BLOCKED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  "169.254.169.254",  // AWS metadata
  "metadata.google.internal",
];
const PRIVATE_IP_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\./,
];

export function isUrlSafe(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    if (!["http:", "https:"].includes(u.protocol)) return false;
    const host = u.hostname.toLowerCase();
    if (BLOCKED_HOSTS.includes(host)) return false;
    if (PRIVATE_IP_RANGES.some((r) => r.test(host))) return false;
    if (host.endsWith(".local") || host.endsWith(".internal")) return false;
    return true;
  } catch {
    return false;
  }
}

// Scan configuration
export const SCAN_CONFIG = {
  discoveryMaxSteps: 10,
  directMaxSteps: 8,
  idleTimeoutMs: 60_000, // abort if no data received for 60s
} as const;
