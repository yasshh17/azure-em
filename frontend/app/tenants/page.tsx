"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";

interface LeaseInfo {
  monthly_rent: number;
  start_date: string;
  end_date: string;
  lease_status: string;
  days_remaining: number;
}

interface TenantRow {
  id: string;
  name: string;
  unit: string;
  email: string;
  phone: string;
  move_in_date: string;
  status: string;
  lease: LeaseInfo | null;
}

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime([now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":"));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ fontFamily: "monospace", fontSize: 9, color: "#6B7A99", letterSpacing: "0.08em" }}>{time}</span>;
}

function TopBar() {
  return (
    <div className="px-14 lg:px-8" style={{ position: "fixed", top: 0, left: 0, right: 0, height: 40, background: "rgba(8,12,20,0.98)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(212,175,114,0.12)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", animation: "statusPulse 2s ease-in-out infinite" }} />
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, color: "#6B7A99", letterSpacing: "0.15em", textTransform: "uppercase" }}>SYSTEM ONLINE</span>
      </div>
      <LiveClock />
    </div>
  );
}

function BottomBar() {
  const items = ["AZURE RESIDENCES", null, "EST. 2024", null, "COLLINS AVENUE · MIAMI BEACH"];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 40, background: "rgba(8,12,20,0.98)", backdropFilter: "blur(8px)", borderTop: "1px solid rgba(212,175,114,0.12)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
      {items.map((item, i) =>
        item === null
          ? <div key={i} style={{ width: 1, height: 14, background: "rgba(212,175,114,0.25)" }} />
          : <span key={i} style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, color: "#6B7A99", letterSpacing: "0.12em" }}>{item}</span>
      )}
    </div>
  );
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active:       { bg: "rgba(74,222,128,0.1)",  color: "#4ADE80", label: "ACTIVE" },
  delinquent:   { bg: "rgba(248,113,113,0.1)", color: "#F87171", label: "DELINQUENT" },
  notice_given: { bg: "rgba(245,158,11,0.1)",  color: "#F59E0B", label: "NOTICE" },
  vacating:     { bg: "rgba(245,158,11,0.1)",  color: "#F59E0B", label: "VACATING" },
};

function leaseEndColor(days: number) {
  if (days < 30) return "#F87171";
  if (days < 60) return "#F59E0B";
  return "#6B7A99";
}

function formatMoveIn(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatLeaseEnd(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className={j === 2 ? "hidden md:table-cell" : ""} style={{ padding: "14px 16px", borderBottom: "1px solid #1C2333" }}>
              <div className="skeleton" style={{ height: 14, width: j === 1 ? 140 : 80, borderRadius: 2 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/tenants`)
      .then((r) => r.json())
      .then((data) => { setTenants(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = tenants.filter((t) => {
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.unit.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
  });

  const activeCount = tenants.filter((t) => t.status === "active").length;
  const expiringCount = tenants.filter((t) => t.lease && t.lease.days_remaining >= 0 && t.lease.days_remaining < 60).length;
  const delinquentCount = tenants.filter((t) => t.status === "delinquent").length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ minHeight: "100vh", background: "#080C14" }}>
      <TopBar />
      <BottomBar />
      <Sidebar />

      <div style={{ position: "absolute", top: 40, bottom: 40, left: 0, right: 0, display: "flex", overflow: "hidden" }}>
        <div className="hidden lg:block" style={{ width: 240, flexShrink: 0 }} />

        <main className="px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10" style={{ flex: 1, overflowY: "auto", background: "#080C14" }}>
          <div style={{ marginBottom: 8 }}>
            <div className="text-[26px] md:text-[36px]" style={{ fontFamily: "Georgia, serif", fontWeight: 200, color: "#F0EDE8", lineHeight: 1 }}>Residents.</div>
            <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B7A99", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 6 }}>Azure Residences — 24 Units</div>
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg,#D4AF72,transparent)", marginBottom: 24, marginTop: 16 }} />

          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { dot: "#4ADE80", label: `${activeCount} Active` },
              { dot: "#F59E0B", label: `${expiringCount} Expiring` },
              { dot: "#F87171", label: `${delinquentCount} Delinquent` },
            ].map(({ dot, label }) => (
              <div key={label} style={{ background: "#0F1623", border: "1px solid #1C2333", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-dm-sans)", fontSize: 12, color: "#F0EDE8" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                {label}
              </div>
            ))}
          </div>

          <input
            className="chat-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, unit, or email..."
            style={{ width: "100%", background: "#0F1623", border: "1px solid #1C2333", padding: "12px 16px", fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#F0EDE8", outline: "none", borderRadius: 0, marginBottom: 20, boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "#D4AF72")}
            onBlur={(e) => (e.target.style.borderColor = "#1C2333")}
          />

          <div className="overflow-x-auto -mx-4 md:mx-0">
          <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0F1623", borderBottom: "2px solid #1C2333" }}>
                {["UNIT", "RESIDENT", "EMAIL", "MOVE-IN", "LEASE ENDS", "RENT", "STATUS"].map((h) => (
                  <th key={h} className={h === "EMAIL" ? "hidden md:table-cell" : ""} style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, color: "#6B7A99", textTransform: "uppercase", letterSpacing: "0.1em", padding: "12px 16px", textAlign: "left", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : (
                filtered.map((t, i) => {
                  const statusStyle = STATUS_STYLE[t.status] ?? { bg: "rgba(107,122,153,0.1)", color: "#6B7A99", label: t.status.toUpperCase() };
                  return (
                    <motion.tr
                      key={t.id}
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: "1px solid #1C2333", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#D4AF72", fontWeight: 500 }}>{t.unit}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#F0EDE8", fontWeight: 500 }}>{t.name}</div>
                        <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 10, color: "#6B7A99", marginTop: 2 }}>{t.phone}</div>
                      </td>
                      <td className="hidden md:table-cell" style={{ padding: "14px 16px", fontFamily: "var(--font-dm-sans)", fontSize: 12, color: "#6B7A99" }}>{t.email}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-dm-sans)", fontSize: 12, color: "#6B7A99" }}>{formatMoveIn(t.move_in_date)}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-dm-sans)", fontSize: 12, color: t.lease ? leaseEndColor(t.lease.days_remaining) : "#6B7A99" }}>
                        {t.lease ? formatLeaseEnd(t.lease.end_date) : "—"}
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#D4AF72" }}>
                        {t.lease ? `$${t.lease.monthly_rent.toLocaleString()}/mo` : "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 8, color: statusStyle.color, background: statusStyle.bg, padding: "3px 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {statusStyle.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#6B7A99" }}>
              No residents match your search.
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
}
