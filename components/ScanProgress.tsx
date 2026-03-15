import { ScanEvent } from "@/app/page";

export default function ScanProgress({
  events,
  scanning,
}: {
  events: ScanEvent[];
  scanning: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 20px",
        marginBottom: 24,
        fontFamily: "monospace",
        fontSize: 13,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          marginBottom: 12,
        }}
      >
        Scan Progress
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {events.map((event) => (
          <div
            key={event.source}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "5px 0",
              borderBottom: "1px solid rgba(30,30,46,0.5)",
              color:
                event.status === "done"
                  ? "#4ade80"
                  : event.status === "error"
                  ? "#f87171"
                  : "var(--text)",
            }}
          >
            <span style={{ width: 18, flexShrink: 0 }}>
              {event.status === "discovering" || event.status === "scanning" ? (
                <SpinnerInline color={event.status === "discovering" ? "#f59e0b" : "#6366f1"} />
              ) : event.status === "done" ? (
                "✓"
              ) : (
                "✗"
              )}
            </span>
            <span style={{ flex: 1, color: "inherit" }}>{event.source}</span>
            {event.status === "discovering" && (
              <span style={{ color: "#f59e0b", fontSize: 11 }}>
                discovering news section...
              </span>
            )}
            {event.status === "scanning" && (
              <span style={{ color: "var(--muted)", fontSize: 11 }}>
                scanning...
              </span>
            )}
            {event.status === "done" && (
              <span
                style={{
                  color: "#4ade80",
                  fontSize: 11,
                  background: "rgba(74,222,128,0.08)",
                  padding: "1px 8px",
                  borderRadius: 4,
                }}
              >
                {event.findingsCount} finding{event.findingsCount !== 1 ? "s" : ""}
              </span>
            )}
            {event.status === "error" && (
              <span
                style={{
                  color: "#f87171",
                  fontSize: 11,
                  background: "rgba(248,113,113,0.08)",
                  padding: "1px 8px",
                  borderRadius: 4,
                }}
              >
                error
              </span>
            )}
          </div>
        ))}

        {scanning && events.length === 0 && (
          <div style={{ color: "var(--muted)", fontSize: 12 }}>
            Initializing scan...
          </div>
        )}

        {!scanning && events.length > 0 && (
          <div
            style={{
              marginTop: 8,
              color: "var(--muted)",
              fontSize: 11,
              textAlign: "right",
            }}
          >
            Scan complete —{" "}
            {events.reduce((a, e) => a + (e.findingsCount ?? 0), 0)} total
            findings
          </div>
        )}
      </div>
    </div>
  );
}

function SpinnerInline({ color = "#6366f1" }: { color?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      style={{ animation: "spin 1s linear infinite", display: "block" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}
