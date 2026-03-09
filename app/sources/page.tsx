"use client";

import { useEffect, useState } from "react";

interface Source {
  name: string;
  type: string;
  url: string;
  findingsCount: number;
  lastScanned: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  Endowment: "#3b82f6",
  "Sovereign Wealth Fund": "#22c55e",
  "Pension Fund": "#f97316",
  Regulatory: "#a855f7",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sources")
      .then((r) => r.json())
      .then((d) => {
        setSources(d.sources ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div
        style={{
          padding: "32px 0 24px",
          borderBottom: "1px solid var(--border)",
          marginBottom: 28,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text)",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          Sources
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: "4px 0 0" }}>
          {sources.length} institutional sources monitored
        </p>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 3fr 1.5fr 100px 80px",
              padding: "10px 20px",
              borderBottom: "1px solid var(--border)",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.7px",
              gap: 16,
            }}
          >
            <span>Name</span>
            <span>Type</span>
            <span>URL</span>
            <span>Last Scanned</span>
            <span style={{ textAlign: "right" }}>Findings</span>
            <span style={{ textAlign: "center" }}>Status</span>
          </div>

          {/* Rows */}
          {sources.map((s, i) => (
            <SourceRow key={s.name} source={s} last={i === sources.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function SourceRow({ source, last }: { source: Source; last: boolean }) {
  const color = TYPE_COLORS[source.type] ?? "#6366f1";
  const hasBeenScanned = source.lastScanned !== null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 3fr 1.5fr 100px 80px",
        padding: "14px 20px",
        borderBottom: last ? "none" : "1px solid var(--border)",
        gap: 16,
        alignItems: "center",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "#13131c";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {source.name}
      </span>

      <span>
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 5,
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color,
            background: `${color}18`,
            border: `1px solid ${color}40`,
          }}
        >
          {source.type}
        </span>
      </span>

      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 11,
          color: "var(--accent)",
          textDecoration: "none",
          fontFamily: "monospace",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <ExternalLinkIcon />
        {source.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
      </a>

      <span
        style={{
          fontSize: 12,
          color: "var(--muted)",
          fontFamily: "monospace",
        }}
      >
        {formatDate(source.lastScanned)}
      </span>

      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: source.findingsCount > 0 ? "var(--accent)" : "var(--muted)",
          textAlign: "right",
        }}
      >
        {source.findingsCount}
      </span>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            background: hasBeenScanned
              ? "rgba(74,222,128,0.1)"
              : "rgba(100,116,139,0.1)",
            color: hasBeenScanned ? "#4ade80" : "var(--muted)",
            border: `1px solid ${hasBeenScanned ? "rgba(74,222,128,0.3)" : "var(--border)"}`,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: hasBeenScanned ? "#4ade80" : "var(--muted)",
              flexShrink: 0,
            }}
          />
          {hasBeenScanned ? "Active" : "Pending"}
        </span>
      </div>
    </div>
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

function SkeletonTable() {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            padding: "14px 20px",
            borderBottom: i < 5 ? "1px solid var(--border)" : "none",
            animation: "pulse 1.5s ease-in-out infinite",
            display: "flex",
            gap: 16,
          }}
        >
          <div
            style={{
              height: 14,
              width: "20%",
              background: "var(--border)",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              height: 14,
              width: "10%",
              background: "var(--border)",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              height: 14,
              width: "30%",
              background: "var(--border)",
              borderRadius: 4,
            }}
          />
        </div>
      ))}
    </div>
  );
}
