"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FindingCard from "@/components/FindingCard";
import ScanProgress from "@/components/ScanProgress";
import StatsRow from "@/components/StatsRow";
import FilterBar from "@/components/FilterBar";

export interface Finding {
  id: string;
  institution: string;
  type: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  sourceUrl: string;
  scannedAt: string;
}

export interface Stats {
  totalFindings: number;
  sourcesMonitored: number;
  lastScan: string | null;
  newToday: number;
}

export interface ScanEvent {
  source?: string;
  status?: "discovering" | "scanning" | "done" | "error";
  findingsCount?: number;
  done?: boolean;
  totalFindings?: number;
  error?: string;
}

export default function Dashboard() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanEvents, setScanEvents] = useState<ScanEvent[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFindings = useCallback(async () => {
    const params = new URLSearchParams();
    if (categoryFilter) params.set("category", categoryFilter);
    if (typeFilter) params.set("type", typeFilter);
    if (searchQuery) params.set("search", searchQuery);
    const res = await fetch(`/api/findings?${params}`);
    const data = await res.json();
    setFindings(data.findings ?? data);
  }, [categoryFilter, typeFilter, searchQuery]);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/stats");
    const data = await res.json();
    setStats(data);
  }, []);

  useEffect(() => {
    Promise.all([fetchFindings(), fetchStats()]).finally(() =>
      setLoading(false)
    );
  }, [fetchFindings, fetchStats]);

  useEffect(() => {
    if (!scanning) fetchFindings();
  }, [categoryFilter, typeFilter, searchQuery, scanning, fetchFindings]);

  const clearAll = async () => {
    if (!confirm("Clear all findings from the database? This cannot be undone.")) return;
    setClearing(true);
    try {
      await fetch("/api/findings", { method: "DELETE" });
      setFindings([]);
      setScanEvents([]);
      await fetchStats();
    } finally {
      setClearing(false);
    }
  };

  const runScan = async () => {
    setScanning(true);
    setScanEvents([]);
    setScanError(null);

    try {
      const response = await fetch("/api/scan", { method: "POST" });
      if (!response.ok) {
        setScanError(`Scan failed: ${response.status} ${response.statusText}`);
        return;
      }
      if (!response.body) {
        setScanError("No response stream from scan endpoint");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event: ScanEvent = JSON.parse(line);

            setScanEvents((prev) => {
              if (event.source) {
                const idx = prev.findIndex((e) => e.source === event.source);
                if (idx >= 0) {
                  const next = [...prev];
                  next[idx] = event;
                  return next;
                }
                return [...prev, event];
              }
              return prev;
            });

            if (event.done) {
              await fetchStats();
              await fetchFindings();
            }
          } catch {
            // ignore parse errors for individual lines
          }
        }
      }
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Scan connection lost");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          padding: "32px 0 24px",
          borderBottom: "1px solid var(--border)",
          marginBottom: 28,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            LP Radar
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: "4px 0 0" }}>
            Where institutional capital meets intelligence
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={clearAll}
            disabled={clearing || scanning}
            aria-label="Clear all findings"
            style={{
              background: "transparent",
              color: clearing ? "var(--muted)" : "var(--negative)",
              border: `1px solid ${clearing ? "var(--border)" : "rgba(255,23,68,0.4)"}`,
              borderRadius: 4,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 700,
              cursor: clearing || scanning ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              opacity: scanning ? 0.4 : 1,
            }}
          >
            {clearing ? (
              <>
                <SpinnerIcon />
                Clearing...
              </>
            ) : (
              <>
                <TrashIcon />
                Clear
              </>
            )}
          </button>

          <button
            onClick={runScan}
            disabled={scanning}
            aria-label={scanning ? "Scan in progress" : "Run scan"}
            style={{
              background: scanning ? "rgba(255,102,0,0.15)" : "var(--accent)",
              color: scanning ? "var(--accent)" : "#000",
              border: scanning
                ? "1px solid rgba(255,102,0,0.3)"
                : "1px solid transparent",
              borderRadius: 4,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 700,
              cursor: scanning ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {scanning ? (
              <>
                <SpinnerIcon />
                Scanning...
              </>
            ) : (
              <>
                <ScanIcon />
                Run Scan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && <StatsRow stats={stats} />}

      {/* Search Bar */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "0 12px",
            gap: 8,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              const val = e.target.value;
              setSearchInput(val);
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => setSearchQuery(val), 300);
            }}
            placeholder="Search institutions, titles, summaries..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-secondary)",
              fontSize: 13,
              fontFamily: "monospace",
              padding: "10px 0",
            }}
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearchQuery(""); }}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: 14,
                padding: 4,
                fontFamily: "monospace",
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Scan Error */}
      {scanError && (
        <div
          style={{
            background: "rgba(255,23,68,0.1)",
            border: "1px solid rgba(255,23,68,0.3)",
            borderRadius: 4,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 13,
            color: "var(--negative)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 700 }}>ERROR</span>
          {scanError}
          <button
            onClick={() => setScanError(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "var(--negative)",
              cursor: "pointer",
              fontSize: 16,
              padding: 4,
            }}
            aria-label="Dismiss error"
          >
            x
          </button>
        </div>
      )}

      {/* Scan Progress */}
      {(scanning || scanEvents.length > 0) && (
        <ScanProgress events={scanEvents} scanning={scanning} />
      )}

      {/* Filter Bar */}
      <FilterBar
        categoryFilter={categoryFilter}
        typeFilter={typeFilter}
        onCategoryChange={setCategoryFilter}
        onTypeChange={setTypeFilter}
      />

      {/* Findings Feed */}
      {loading ? (
        <SkeletonFeed />
      ) : findings.length === 0 ? (
        <EmptyState scanning={scanning} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {findings.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
      )}
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function SkeletonFeed() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: 20,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        >
          <div style={{ height: 14, width: "30%", background: "var(--border)", borderRadius: 2, marginBottom: 12 }} />
          <div style={{ height: 18, width: "70%", background: "var(--border)", borderRadius: 2, marginBottom: 8 }} />
          <div style={{ height: 14, width: "90%", background: "var(--border)", borderRadius: 2 }} />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ scanning }: { scanning: boolean }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--muted)" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>
        {scanning ? "Scanning sources..." : "No findings yet"}
      </div>
      <div style={{ fontSize: 14 }}>
        {scanning
          ? "Intelligence is being gathered from institutional sources."
          : "Run a scan to monitor institutional investor activity."}
      </div>
    </div>
  );
}
