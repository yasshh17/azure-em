"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Wrench } from "lucide-react";
import Sidebar from "@/components/Sidebar";

interface TicketRow {
  id: string;
  unit: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  created_date: string;
  tenant_name: string;
  vendor_name: string;
  assigned_vendor_id: string | null;
}

type TabValue = "all" | "open" | "in_progress" | "resolved";

const TABS: { label: string; value: TabValue }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
];

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "#F87171",
  high: "#F59E0B",
  medium: "#D4AF72",
  low: "#4ADE80",
};

const PRIORITY_BG: Record<string, string> = {
  urgent: "rgba(248,113,113,0.12)",
  high: "rgba(245,158,11,0.12)",
  medium: "rgba(212,175,114,0.12)",
  low: "rgba(74,222,128,0.12)",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  open:        { bg: "rgba(248,113,113,0.1)", color: "#F87171" },
  in_progress: { bg: "rgba(245,158,11,0.1)",  color: "#F59E0B" },
  resolved:    { bg: "rgba(74,222,128,0.1)",  color: "#4ADE80" },
  closed:      { bg: "rgba(107,122,153,0.1)", color: "#6B7A99" },
};

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

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("all");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/maintenance`)
      .then((r) => r.json())
      .then((data) => { setTickets(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = tickets.filter((t) => activeTab === "all" || t.status === activeTab);

  const counts = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ minHeight: "100vh", background: "#080C14" }}>
      <TopBar />
      <BottomBar />
      <Sidebar />

      <div style={{ position: "absolute", top: 40, bottom: 40, left: 0, right: 0, display: "flex", overflow: "hidden" }}>
        <div className="hidden lg:block" style={{ width: 240, flexShrink: 0 }} />

        <main className="px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10" style={{ flex: 1, overflowY: "auto", background: "#080C14" }}>
          <div style={{ marginBottom: 8 }}>
            <div className="text-[26px] md:text-[36px]" style={{ fontFamily: "Georgia, serif", fontWeight: 200, color: "#F0EDE8", lineHeight: 1 }}>Maintenance.</div>
            <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B7A99", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 6 }}>Azure Residences — Work Orders</div>
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg,#D4AF72,transparent)", marginBottom: 24, marginTop: 16 }} />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ marginBottom: 24 }}>
            {[
              { label: "TOTAL", value: counts.total, color: "#F0EDE8" },
              { label: "OPEN", value: counts.open, color: counts.open > 5 ? "#F87171" : "#F59E0B" },
              { label: "IN PROGRESS", value: counts.in_progress, color: "#F59E0B" },
              { label: "RESOLVED", value: counts.resolved, color: "#4ADE80" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "#0F1623", border: "1px solid #1C2333", padding: 16, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 8, color: "#6B7A99", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 24, fontWeight: 500, color }}>{loading ? "—" : value}</div>
              </div>
            ))}
          </div>

          <div className="flex overflow-x-auto no-scrollbar" style={{ borderBottom: "1px solid #1C2333", marginBottom: 20 }}>
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                style={{
                  fontFamily: "var(--font-dm-sans)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em",
                  padding: "10px 20px", background: "transparent", border: "none",
                  borderBottom: activeTab === tab.value ? "2px solid #D4AF72" : "2px solid transparent",
                  color: activeTab === tab.value ? "#D4AF72" : "#6B7A99",
                  cursor: "pointer", marginBottom: -1, transition: "color 0.15s",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  minHeight: 44,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 100, borderRadius: 0 }} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map((ticket, i) => {
                  const pColor = PRIORITY_COLOR[ticket.priority] ?? "#6B7A99";
                  const pBg = PRIORITY_BG[ticket.priority] ?? "rgba(107,122,153,0.1)";
                  const sStyle = STATUS_STYLE[ticket.status] ?? { bg: "rgba(107,122,153,0.1)", color: "#6B7A99" };
                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ background: "#0F1623", border: "1px solid #1C2333", borderLeft: `3px solid ${pColor}`, padding: "16px 20px" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 8, color: pColor, background: pBg, padding: "3px 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {ticket.priority}
                          </span>
                          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#D4AF72", fontWeight: 500 }}>{ticket.unit}</span>
                          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 12, color: "#6B7A99", textTransform: "capitalize" }}>{ticket.category}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 8, color: sStyle.color, background: sStyle.bg, padding: "3px 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {ticket.status.replace("_", " ")}
                          </span>
                          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 10, color: "#6B7A99" }}>{ticket.created_date}</span>
                        </div>
                      </div>

                      <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#F0EDE8", marginTop: 6, lineHeight: 1.5 }}>
                        {ticket.description}
                      </div>

                      <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <User size={11} color="#6B7A99" />
                          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B7A99" }}>{ticket.tenant_name}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Wrench size={11} color="#6B7A99" />
                          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B7A99" }}>{ticket.vendor_name}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {filtered.length === 0 && (
                  <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#6B7A99" }}>
                    No tickets in this category.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </motion.div>
  );
}
