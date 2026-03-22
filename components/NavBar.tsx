"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--card)",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 32,
          height: 48,
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontFamily: "monospace",
              }}
            >
              LP RADAR
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", gap: 2 }}>
          {[
            { href: "/", label: "DASHBOARD" },
            { href: "/sources", label: "SOURCES" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: "6px 12px",
                borderRadius: 2,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: "0.5px",
                fontFamily: "monospace",
                color:
                  pathname === href ? "var(--text)" : "var(--muted)",
                background:
                  pathname === href
                    ? "rgba(255,140,0,0.1)"
                    : "transparent",
                borderBottom:
                  pathname === href
                    ? "2px solid var(--text)"
                    : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
