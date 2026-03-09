import { Stats } from "@/app/page";

const TYPE_COLORS: Record<string, string> = {};

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StatsRow({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: "Total Findings",
      value: stats.totalFindings.toLocaleString(),
      accent: false,
    },
    {
      label: "Sources Monitored",
      value: stats.sourcesMonitored.toLocaleString(),
      accent: false,
    },
    {
      label: "Last Scan",
      value: formatDate(stats.lastScan),
      accent: false,
      mono: true,
    },
    {
      label: "New Today",
      value: stats.newToday.toLocaleString(),
      accent: stats.newToday > 0,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
        marginBottom: 28,
      }}
    >
      {cards.map(({ label, value, accent, mono }) => (
        <div
          key={label}
          style={{
            background: "var(--card)",
            border: `1px solid ${accent ? "rgba(99,102,241,0.4)" : "var(--border)"}`,
            borderRadius: 10,
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: 8,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: mono ? 15 : 24,
              fontWeight: 700,
              color: accent ? "var(--accent)" : "var(--text)",
              fontFamily: mono ? "monospace" : "inherit",
              letterSpacing: "-0.5px",
            }}
          >
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
