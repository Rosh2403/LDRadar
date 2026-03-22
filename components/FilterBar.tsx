"use client";

import { CATEGORIES, TYPES, CATEGORY_COLORS, TYPE_COLORS } from "@/lib/constants";

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
    padding: "4px 10px",
    borderRadius: 2,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "monospace",
    letterSpacing: "0.3px",
    border: active
      ? `1px solid ${color ?? "var(--accent)"}`
      : "1px solid var(--border)",
    background: active
      ? color
        ? `${color}22`
        : "rgba(255,102,0,0.12)"
      : "var(--card)",
    color: active ? (color ?? "var(--accent)") : "var(--muted)",
    transition: "all 0.1s",
    whiteSpace: "nowrap" as const,
  });

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
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
        <span
          style={{
            fontSize: 10,
            color: "var(--muted)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            marginRight: 4,
            fontFamily: "monospace",
          }}
        >
          Category
        </span>
        <button
          style={chipStyle(!categoryFilter)}
          onClick={() => onCategoryChange("")}
          aria-label="Show all categories"
        >
          ALL
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            style={chipStyle(categoryFilter === c, CATEGORY_COLORS[c])}
            onClick={() => onCategoryChange(categoryFilter === c ? "" : c)}
            aria-label={`Filter by ${c}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div
        style={{
          width: 1,
          height: 20,
          background: "var(--border)",
          flexShrink: 0,
        }}
      />

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
        <span
          style={{
            fontSize: 10,
            color: "var(--muted)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            marginRight: 4,
            fontFamily: "monospace",
          }}
        >
          Type
        </span>
        <button
          style={chipStyle(!typeFilter)}
          onClick={() => onTypeChange("")}
          aria-label="Show all types"
        >
          ALL
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            style={chipStyle(typeFilter === t, TYPE_COLORS[t])}
            onClick={() => onTypeChange(typeFilter === t ? "" : t)}
            aria-label={`Filter by ${t}`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
