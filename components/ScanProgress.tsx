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
        borderRadius: 4,
        padding: "16px 20px",
        marginBottom: 24,
        fontFamily: "monospace",
        fontSize: 12,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--text)",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: 12,
        }}
      >
        Scan Progress
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {events.map((event) => (
          <div
            key={event.source}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "4px 0",
              borderBottom: "1px solid rgba(26,26,26,0.8)",
              color:
                event.status === "done"
                  ? "var(--positive)"
                  : event.status === "error"
                  ? "var(--negative)"
                  : "var(--text-secondary)",
            }}
          >
            <span style={{ width: 18, flexShrink: 0 }}>
              {event.status === "discovering" || event.status === "scanning" ? (
                <SpinnerInline color={event.status === "discovering" ? "var(--warning)" : "var(--accent)"} />
              ) : event.status === "done" ? (
                <span style={{ color: "var(--positive)" }}>OK</span>
              ) : (
                <span style={{ color: "var(--negative)" }}>XX</span>
              )}
            </span>
            <span style={{ flex: 1, color: "inherit" }}>{event.source}</span>
            {event.status === "discovering" && (
              <span style={{ color: "var(--warning)", fontSize: 11 }}>
                discovering...
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
                  color: "var(--positive)",
                  fontSize: 11,
                  background: "rgba(0,200,83,0.08)",
                  padding: "1px 8px",
                  borderRadius: 2,
                }}
              >
                {event.findingsCount} finding{event.findingsCount !== 1 ? "s" : ""}
              </span>
            )}
            {event.status === "error" && (
              <span
                style={{
                  color: "var(--negative)",
                  fontSize: 11,
                  background: "rgba(255,23,68,0.08)",
                  padding: "1px 8px",
                  borderRadius: 2,
                }}
              >
                ERROR
              </span>
            )}
          </div>
        ))}

        {scanning && events.length === 0 && (
          <div style={{ color: "var(--warning)", fontSize: 11 }}>
            Initializing scan...
          </div>
        )}

        {!scanning && events.length > 0 && (
          <div
            style={{
              marginTop: 8,
              color: "var(--text)",
              fontSize: 11,
              textAlign: "right",
              fontWeight: 700,
            }}
          >
            SCAN COMPLETE —{" "}
            {events.reduce((a, e) => a + (e.findingsCount ?? 0), 0)} TOTAL
            FINDINGS
          </div>
        )}
      </div>
    </div>
  );
}

function SpinnerInline({ color = "var(--accent)" }: { color?: string }) {
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
