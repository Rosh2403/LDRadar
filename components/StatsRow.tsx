import { Stats } from "@/app/page";
import { formatDate } from "@/lib/constants";

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
      value: stats.lastScan ? formatDate(stats.lastScan) : "Never",
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
        gap: 8,
        marginBottom: 28,
      }}
    >
      {cards.map(({ label, value, accent, mono }) => (
        <div
          key={label}
          style={{
            background: "var(--card)",
            border: `1px solid ${accent ? "rgba(255,102,0,0.4)" : "var(--border)"}`,
            borderRadius: 4,
            padding: "14px 18px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: 6,
              fontFamily: "monospace",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: mono ? 14 : 22,
              fontWeight: 700,
              color: accent ? "var(--accent)" : "var(--text)",
              fontFamily: "monospace",
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
