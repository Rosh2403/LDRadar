"use client";

import { useState, useEffect, useCallback } from "react";
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
  status?: "scanning" | "done" | "error";
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
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFindings = useCallback(async () => {
    const params = new URLSearchParams();
    if (categoryFilter) params.set("category", categoryFilter);
    if (typeFilter) params.set("type", typeFilter);
    const res = await fetch(`/api/findings?${params}`);
    const data = await res.json();
    setFindings(data);
  }, [categoryFilter, typeFilter]);

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
    if (!scanning) {
      fetchFindings();
    }
  }, [categoryFilter, typeFilter, scanning, fetchFindings]);

  const runScan = async () => {
    setScanning(true);
    setScanEvents([]);

    try {
      const response = await fetch("/api/scan", { method: "POST" });
      if (!response.body) return;

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
            // ignore parse errors
          }
        }
      }
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
          <p
            style={{
              fontSize: 14,
              color: "var(--muted)",
              margin: "4px 0 0",
            }}
          >
            Institutional investor intelligence, automated
          </p>
        </div>

        <button
          onClick={runScan}
          disabled={scanning}
          style={{
            background: scanning ? "rgba(99,102,241,0.15)" : "var(--accent)",
            color: scanning ? "var(--accent)" : "#fff",
            border: scanning
              ? "1px solid rgba(99,102,241,0.3)"
              : "1px solid transparent",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 600,
            cursor: scanning ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.15s",
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

      {/* Stats */}
      {stats && <StatsRow stats={stats} />}

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
            borderRadius: 10,
            padding: 20,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        >
          <div
            style={{
              height: 14,
              width: "30%",
              background: "var(--border)",
              borderRadius: 4,
              marginBottom: 12,
            }}
          />
          <div
            style={{
              height: 18,
              width: "70%",
              background: "var(--border)",
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <div
            style={{
              height: 14,
              width: "90%",
              background: "var(--border)",
              borderRadius: 4,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ scanning }: { scanning: boolean }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 24px",
        color: "var(--muted)",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>
        {scanning ? "⏳" : "📡"}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: 8,
        }}
      >
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
