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
          height: 56,
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--accent)",
                letterSpacing: "-0.5px",
              }}
            >
              LP
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.5px",
              }}
            >
              Radar
            </span>
            <span
              style={{
                fontSize: 10,
                background: "rgba(99,102,241,0.15)",
                color: "var(--accent)",
                padding: "1px 6px",
                borderRadius: 4,
                border: "1px solid rgba(99,102,241,0.3)",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              BETA
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", gap: 4 }}>
          {[
            { href: "/", label: "Dashboard" },
            { href: "/sources", label: "Sources" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                color:
                  pathname === href ? "var(--accent)" : "var(--muted)",
                background:
                  pathname === href
                    ? "rgba(99,102,241,0.1)"
                    : "transparent",
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
