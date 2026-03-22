"use client";

import { useEffect, useState } from "react";
import { TYPE_COLORS, SOURCE_TYPES, formatDate } from "@/lib/constants";

interface Source {
  id: string | null;
  name: string;
  type: string;
  url: string;
  findingsCount: number;
  lastScanned: string | null;
  isCustom: boolean;
}

interface ScanProgress {
  status: "discovering" | "done" | "error";
  findingsCount: number;
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Add source form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", type: "Other" });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addProgress, setAddProgress] = useState<ScanProgress | null>(null);

  const fetchSources = () => {
    fetch("/api/sources")
      .then((r) => r.json())
      .then((d) => {
        setSources(d.sources ?? []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchSources(); }, []);

  const handleAddSource = async () => {
    setAddError("");
    setAddProgress(null);

    if (!form.name.trim() || !form.url.trim()) {
      setAddError("Name and URL are required.");
      return;
    }
    try { new URL(form.url); } catch {
      setAddError("Please enter a valid URL (e.g. https://www.blackrock.com/)");
      return;
    }

    setAdding(true);
    setAddProgress({ status: "discovering", findingsCount: 0 });

    try {
      const response = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.body) throw new Error("No response body");

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
            const event = JSON.parse(line);
            if (event.error) { setAddError(event.error); break; }
            if (event.status) setAddProgress({ status: event.status, findingsCount: event.findingsCount ?? 0 });
            if (event.done) {
              setShowForm(false);
              setForm({ name: "", url: "", type: "Other" });
              setAddProgress(null);
              fetchSources();
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add source");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" and all its findings?`)) return;
    setDeleting(id);
    try {
      await fetch(`/api/sources/${id}`, { method: "DELETE" });
      fetchSources();
    } finally {
      setDeleting(null);
    }
  };

  const customCount = sources.filter((s) => s.isCustom).length;

  const inputStyle = {
    width: "100%",
    background: "#000",
    border: "1px solid var(--border)",
    borderRadius: 2,
    padding: "9px 12px",
    fontSize: 13,
    color: "var(--text)",
    fontFamily: "monospace",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <div>
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
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            Sources
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0", fontFamily: "monospace" }}>
            {sources.length} sources monitored
            {customCount > 0 && ` | ${customCount} custom`}
          </p>
        </div>

        <button
          onClick={() => { setShowForm(!showForm); setAddError(""); setAddProgress(null); }}
          aria-label={showForm ? "Cancel adding source" : "Add source"}
          style={{
            background: showForm ? "rgba(255,102,0,0.15)" : "var(--accent)",
            color: showForm ? "var(--accent)" : "#000",
            border: showForm ? "1px solid rgba(255,102,0,0.3)" : "1px solid transparent",
            borderRadius: 4,
            padding: "9px 18px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontFamily: "monospace",
          }}
        >
          <PlusIcon />
          {showForm ? "Cancel" : "Add Source"}
        </button>
      </div>

      {/* Add Source Form */}
      {showForm && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid rgba(255,102,0,0.3)",
            borderRadius: 4,
            padding: "20px 24px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: 16,
              fontFamily: "monospace",
            }}
          >
            ADD CUSTOM SOURCE
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "2 1 200px" }}>
              <label style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                URL (homepage)
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://www.blackrock.com/"
                disabled={adding}
                style={inputStyle}
              />
            </div>

            <div style={{ flex: "1.5 1 160px" }}>
              <label style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Institution Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="BlackRock"
                disabled={adding}
                style={inputStyle}
              />
            </div>

            <div style={{ flex: "1 1 140px" }}>
              <label style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                disabled={adding}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {SOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddSource}
              disabled={adding}
              style={{
                background: adding ? "rgba(255,102,0,0.15)" : "var(--accent)",
                color: adding ? "var(--accent)" : "#000",
                border: "1px solid transparent",
                borderRadius: 2,
                padding: "9px 20px",
                fontSize: 12,
                fontWeight: 700,
                cursor: adding ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 7,
                flexShrink: 0,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontFamily: "monospace",
              }}
            >
              {adding ? <><SpinnerIcon color="var(--accent)" /> Scanning...</> : "Add & Scan"}
            </button>
          </div>

          {/* Live progress */}
          {addProgress && (
            <div
              style={{
                marginTop: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 12,
                padding: "10px 14px",
                background: "#000",
                borderRadius: 2,
                border: "1px solid var(--border)",
                fontFamily: "monospace",
              }}
            >
              {addProgress.status === "discovering" ? (
                <>
                  <SpinnerIcon color="var(--warning)" />
                  <span style={{ color: "var(--warning)" }}>
                    Discovering news section on <strong style={{ color: "var(--text)" }}>{form.name || form.url}</strong>...
                  </span>
                </>
              ) : addProgress.status === "done" ? (
                <>
                  <span style={{ color: "var(--positive)", fontWeight: 700 }}>OK</span>
                  <span style={{ color: "var(--positive)" }}>
                    Found <strong>{addProgress.findingsCount}</strong> finding{addProgress.findingsCount !== 1 ? "s" : ""} from {form.name}
                  </span>
                </>
              ) : (
                <>
                  <span style={{ color: "var(--negative)", fontWeight: 700 }}>ERR</span>
                  <span style={{ color: "var(--negative)" }}>Scan failed — source saved, try again on next full scan</span>
                </>
              )}
            </div>
          )}

          {addError && (
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--negative)", fontFamily: "monospace" }}>
              ERROR: {addError}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <SkeletonTable />
      ) : (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 3fr 1.5fr 100px 80px 40px",
              padding: "10px 20px",
              borderBottom: "1px solid var(--border)",
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              gap: 16,
              fontFamily: "monospace",
            }}
          >
            <span>Name</span>
            <span>Type</span>
            <span>URL</span>
            <span>Last Scanned</span>
            <span style={{ textAlign: "right" }}>Findings</span>
            <span style={{ textAlign: "center" }}>Status</span>
            <span />
          </div>

          {/* Rows */}
          {sources.map((s, i) => (
            <SourceRow
              key={s.id ?? s.name}
              source={s}
              last={i === sources.length - 1}
              onDelete={s.isCustom && s.id ? () => handleDelete(s.id!, s.name) : undefined}
              isDeleting={deleting === s.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SourceRow({
  source,
  last,
  onDelete,
  isDeleting,
}: {
  source: Source;
  last: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
}) {
  const color = TYPE_COLORS[source.type] ?? "var(--muted)";
  const hasBeenScanned = source.lastScanned !== null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 3fr 1.5fr 100px 80px 40px",
        padding: "12px 20px",
        borderBottom: last ? "none" : "1px solid var(--border)",
        gap: 16,
        alignItems: "center",
        transition: "background 0.1s",
        opacity: isDeleting ? 0.5 : 1,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#0d0d0d"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    >
      {/* Name + Custom badge */}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--text-secondary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontFamily: "monospace",
          }}
        >
          {source.name}
        </span>
        {source.isCustom && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              color: "var(--warning)",
              background: "rgba(255,171,0,0.12)",
              border: "1px solid rgba(255,171,0,0.3)",
              borderRadius: 2,
              padding: "1px 6px",
              flexShrink: 0,
              fontFamily: "monospace",
            }}
          >
            Custom
          </span>
        )}
      </span>

      {/* Type badge */}
      <span>
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
          }}
        >
          {source.type}
        </span>
      </span>

      {/* URL */}
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 11,
          color: "var(--link)",
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

      {/* Last Scanned */}
      <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
        {formatDate(source.lastScanned)}
      </span>

      {/* Findings count */}
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: source.findingsCount > 0 ? "var(--text)" : "var(--muted)",
          textAlign: "right",
          fontFamily: "monospace",
        }}
      >
        {source.findingsCount}
      </span>

      {/* Status */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 10px",
            borderRadius: 2,
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontFamily: "monospace",
            background: hasBeenScanned ? "rgba(0,200,83,0.1)" : "rgba(102,102,102,0.1)",
            color: hasBeenScanned ? "var(--positive)" : "var(--muted)",
            border: `1px solid ${hasBeenScanned ? "rgba(0,200,83,0.3)" : "var(--border)"}`,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: hasBeenScanned ? "var(--positive)" : "var(--muted)",
              flexShrink: 0,
            }}
          />
          {hasBeenScanned ? "Active" : "Pending"}
        </span>
      </div>

      {/* Delete button (custom sources only) */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        {onDelete && (
          <button
            onClick={onDelete}
            disabled={isDeleting}
            title="Remove source"
            aria-label={`Remove ${source.name}`}
            style={{
              background: "none",
              border: "none",
              cursor: isDeleting ? "not-allowed" : "pointer",
              color: "var(--muted)",
              padding: 4,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--negative)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function SpinnerIcon({ color = "var(--accent)" }: { color?: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
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
        borderRadius: 4,
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
          <div style={{ height: 14, width: "20%", background: "var(--border)", borderRadius: 2 }} />
          <div style={{ height: 14, width: "10%", background: "var(--border)", borderRadius: 2 }} />
          <div style={{ height: 14, width: "30%", background: "var(--border)", borderRadius: 2 }} />
        </div>
      ))}
    </div>
  );
}
