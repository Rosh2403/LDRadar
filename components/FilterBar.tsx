"use client";

const CATEGORIES = [
  "Leadership",
  "Allocation",
  "Mandate",
  "Policy",
  "Portfolio",
];

const TYPES = [
  "Endowment",
  "Sovereign Wealth Fund",
  "Pension Fund",
  "Regulatory",
];

export default function FilterBar({
  categoryFilter,
  typeFilter,
  onCategoryChange,
  onTypeChange,
}: {
  categoryFilter: string;
  typeFilter: string;
  onCategoryChange: (v: string) => void;
  onTypeChange: (v: string) => void;
}) {
  const chipStyle = (active: boolean, color?: string) => ({
    padding: "5px 12px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    border: active
      ? `1px solid ${color ?? "var(--accent)"}`
      : "1px solid var(--border)",
    background: active
      ? color
        ? `${color}22`
        : "rgba(99,102,241,0.12)"
      : "var(--card)",
    color: active ? (color ?? "var(--accent)") : "var(--muted)",
    transition: "all 0.1s",
    whiteSpace: "nowrap" as const,
  });

  const categoryColors: Record<string, string> = {
    Leadership: "#f87171",
    Allocation: "#60a5fa",
    Mandate: "#4ade80",
    Policy: "#fbbf24",
    Portfolio: "#c084fc",
  };

  const typeColors: Record<string, string> = {
    Endowment: "#60a5fa",
    "Sovereign Wealth Fund": "#4ade80",
    "Pension Fund": "#fb923c",
    Regulatory: "#c084fc",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        marginBottom: 20,
        flexWrap: "wrap",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <span
          style={{
            fontSize: 11,
            color: "var(--muted)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            marginRight: 4,
          }}
        >
          Category
        </span>
        <button
          style={chipStyle(!categoryFilter)}
          onClick={() => onCategoryChange("")}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            style={chipStyle(categoryFilter === c, categoryColors[c])}
            onClick={() => onCategoryChange(categoryFilter === c ? "" : c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div
        style={{
          width: 1,
          height: 24,
          background: "var(--border)",
          flexShrink: 0,
        }}
      />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <span
          style={{
            fontSize: 11,
            color: "var(--muted)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            marginRight: 4,
          }}
        >
          Type
        </span>
        <button
          style={chipStyle(!typeFilter)}
          onClick={() => onTypeChange("")}
        >
          All
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            style={chipStyle(typeFilter === t, typeColors[t])}
            onClick={() => onTypeChange(typeFilter === t ? "" : t)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
