"use client";

export interface BriefingData {
  id: string;
  summary: string;
  patterns: string[];
  hotSectors: string[];
  activeLPs: string[];
  watchList: string[];
  findingCount: number;
  createdAt: string;
}

export default function BriefingCard({
  briefing,
  synthesizing,
}: {
  briefing: BriefingData | null;
  synthesizing: boolean;
}) {
  if (synthesizing) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.03))",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}
        >
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
        <span style={{ fontSize: 14, color: "var(--accent)", fontWeight: 500 }}>
          Synthesizing intelligence briefing across all sources...
        </span>
      </div>
    );
  }

  if (!briefing) return null;

  const sections = [
    { label: "Macro Patterns", items: briefing.patterns, color: "#6366f1" },
    { label: "Hot Sectors", items: briefing.hotSectors, color: "#f59e0b" },
    { label: "Most Active LPs", items: briefing.activeLPs, color: "#10b981" },
    { label: "Watch List", items: briefing.watchList, color: "#f87171" },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02))",
        border: "1px solid rgba(99,102,241,0.25)",
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 24,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 16 }}>⚡</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          Intelligence Briefing
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "var(--muted)",
            fontFamily: "monospace",
          }}
        >
          {briefing.findingCount} findings analyzed
        </span>
      </div>

      {/* Summary */}
      <p
        style={{
          fontSize: 14,
          color: "var(--text)",
          lineHeight: 1.65,
          margin: "0 0 18px",
          fontStyle: "italic",
          borderLeft: "2px solid rgba(99,102,241,0.4)",
          paddingLeft: 12,
        }}
      >
        {briefing.summary}
      </p>

      {/* Grid of sections */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {sections.map(({ label, items, color }) =>
          items.length === 0 ? null : (
            <div key={label}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color,
                  textTransform: "uppercase",
                  letterSpacing: "0.7px",
                  marginBottom: 8,
                }}
              >
                {label}
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {items.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 12,
                      color: "var(--text)",
                      lineHeight: 1.5,
                      paddingBottom: 4,
                      display: "flex",
                      gap: 6,
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ color, flexShrink: 0, marginTop: 2 }}>›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>
    </div>
  );
}
