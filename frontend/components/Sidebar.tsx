"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Wrench,
  Store,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { label: "Dashboard",    href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Assistant", href: "/chat",       icon: MessageSquare  },
  { label: "Tenants",      href: "/tenants",     icon: Users          },
  { label: "Maintenance",  href: "/maintenance", icon: Wrench         },
  { label: "Vendors",      href: "/vendors",     icon: Store          },
  { label: "Settings",     href: "/settings",    icon: Settings       },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="lg:hidden fixed flex items-center justify-center"
        style={{
          top: 4,
          left: 4,
          width: 44,
          height: 44,
          background: "rgba(8,12,20,0.92)",
          color: "#D4AF72",
          border: "1px solid rgba(212,175,114,0.25)",
          zIndex: 60,
          cursor: "pointer",
        }}
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          onClick={close}
          className="lg:hidden fixed inset-0"
          style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 55,
          }}
        />
      )}

      <aside
        className={`fixed flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          top: 40,
          left: 0,
          bottom: 40,
          width: 240,
          background: "#080C14",
          borderRight: "1px solid #1C2333",
          zIndex: 60,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid #1C2333", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 32,
                fontWeight: 400,
                color: "#D4AF72",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              EM
            </div>
            <div
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 11,
                color: "#6B7A99",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Azure Residences
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Close navigation"
            className="lg:hidden flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              background: "transparent",
              color: "#6B7A99",
              border: "none",
              cursor: "pointer",
              marginTop: -4,
              marginRight: -8,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <nav style={{ paddingTop: 8, flex: 1 }}>
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={close}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: active ? "13px 24px 13px 22px" : "13px 24px",
                  minHeight: 44,
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: 13,
                  color: active ? "#D4AF72" : "#6B7A99",
                  borderLeft: active ? "2px solid #D4AF72" : "2px solid transparent",
                  background: active ? "rgba(212,175,114,0.04)" : "transparent",
                  textDecoration: "none",
                  transition: "color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#F0EDE8";
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.02)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#6B7A99";
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid #1C2333" }}>
          <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(212,175,114,0.15)",
                border: "1px solid rgba(212,175,114,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#D4AF72" }}>M</span>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#F0EDE8", fontWeight: 500 }}>Property Manager</div>
              <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, color: "#6B7A99", marginTop: 1 }}>Azure Residences</div>
            </div>
          </div>

          <div
            role="button"
            onClick={() => { close(); router.push("/"); }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 20px", margin: "0 0 8px 0",
              minHeight: 44,
              fontFamily: "var(--font-dm-sans)", fontSize: 12,
              color: "#6B7A99", cursor: "pointer",
              borderLeft: "2px solid transparent",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.color = "#F87171";
              el.style.borderLeftColor = "#F87171";
              el.style.background = "rgba(248,113,113,0.04)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.color = "#6B7A99";
              el.style.borderLeftColor = "transparent";
              el.style.background = "transparent";
            }}
          >
            <LogOut size={16} />
            Sign Out
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            borderTop: "1px solid #1C2333",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#4ADE80",
              flexShrink: 0,
              animation: "statusPulse 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 10,
              color: "#6B7A99",
            }}
          >
            All systems operational
          </span>
        </div>
      </aside>
    </>
  );
}
