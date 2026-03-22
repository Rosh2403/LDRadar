"use client";

import { Finding } from "@/app/page";
import { TYPE_COLORS, CATEGORY_COLORS, timeAgo } from "@/lib/constants";

export default function FindingCard({ finding }: { finding: Finding }) {
  const typeColor = TYPE_COLORS[finding.type] ?? "var(--muted)";
  const categoryColor = CATEGORY_COLORS[finding.category] ?? "var(--muted)";

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 4,
        padding: "16px 20px",
        transition: "border-color 0.15s, background 0.15s",
        cursor: "default",
        borderLeft: `3px solid var(--text)`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(255,140,0,0.35)";
        (e.currentTarget as HTMLDivElement).style.background = "#0d0d0d";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.borderLeftColor = "var(--text)";
        (e.currentTarget as HTMLDivElement).style.background = "var(--card)";
      }}
    >
      {/* Top row: institution + type badge + category badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            fontFamily: "monospace",
          }}
        >
          {finding.institution}
        </span>

        <Badge color={typeColor}>{finding.type}</Badge>
        <Badge color={categoryColor}>{finding.category}</Badge>

        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "var(--muted)",
            fontFamily: "monospace",
            flexShrink: 0,
          }}
        >
          {timeAgo(finding.scannedAt)}
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--text-secondary)",
          marginBottom: 8,
          lineHeight: 1.4,
        }}
      >
        {finding.title}
      </div>

      {/* Summary */}
      <div
        style={{
          fontSize: 13,
          color: "var(--muted)",
          lineHeight: 1.6,
          marginBottom: 12,
        }}
      >
        {finding.summary}
      </div>

      {/* Footer: date + source URL */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {finding.date && (
          <span
            style={{
              fontSize: 11,
              color: "var(--muted)",
              fontFamily: "monospace",
            }}
          >
            {finding.date}
          </span>
        )}

        {finding.sourceUrl && (
          <a
            href={finding.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              color: "var(--link)",
              textDecoration: "none",
              fontFamily: "monospace",
              maxWidth: 320,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon />
            {finding.sourceUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        )}
      </div>
    </div>
  );
}

function Badge({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 2,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        fontFamily: "monospace",
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
