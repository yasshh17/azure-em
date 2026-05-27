"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import Sidebar from "@/components/Sidebar";

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
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 40, background: "rgba(8,12,20,0.98)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(212,175,114,0.12)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
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

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: on ? "#D4AF72" : "#1C2333",
        position: "relative", cursor: "pointer",
        transition: "background 0.2s ease", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 2,
        left: on ? 18 : 2,
        width: 18, height: 18, borderRadius: "50%",
        background: "#F0EDE8",
        transition: "left 0.2s ease",
      }} />
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <>
      <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, color: "#6B7A99", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>{children}</div>
      <div style={{ height: 1, background: "linear-gradient(90deg,rgba(212,175,114,0.3),transparent)", marginBottom: 16 }} />
    </>
  );
}

function AccountRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: last ? "none" : "1px solid #1C2333" }}>
      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, color: "#6B7A99", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 12, color: "#F0EDE8" }}>{value}</span>
    </div>
  );
}

function StatRow({ label, value, color, last }: { label: string; value: string | number; color: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: last ? "none" : "1px solid #1C2333" }}>
      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, color: "#6B7A99", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 16, fontWeight: 500, color }}>{value}</span>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    leaseExpiry: true,
    urgentMaintenance: true,
    moveInReminders: true,
    monthlyRevenue: false,
  });

  function toggle(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const notifRows: { key: keyof typeof notifications; title: string; description: string }[] = [
    { key: "leaseExpiry",        title: "Lease Expiry Alerts",     description: "Notify when leases expire within 30 days" },
    { key: "urgentMaintenance",  title: "Urgent Maintenance",       description: "Immediate alerts for urgent work orders" },
    { key: "moveInReminders",    title: "Move-in Reminders",        description: "Reminders 7 days before tenant move-in dates" },
    { key: "monthlyRevenue",     title: "Monthly Revenue Summary",  description: "Monthly report of revenue and occupancy" },
  ];

  const profileCells = [
    { label: "PROPERTY",         value: "Azure Residences" },
    { label: "ADDRESS",          value: "Collins Avenue, Miami Beach, FL" },
    { label: "TOTAL UNITS",      value: "24 Residences" },
    { label: "OCCUPANCY",        value: "20 Occupied · 4 Vacant" },
    { label: "MONTHLY REVENUE",  value: "$260,500" },
    { label: "ESTABLISHED",      value: "2024" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ minHeight: "100vh", background: "#080C14" }}>
      <TopBar />
      <BottomBar />
      <Sidebar />

      <div style={{ position: "absolute", top: 40, bottom: 40, left: 0, right: 0, display: "flex", overflow: "hidden" }}>
        <div style={{ width: 240, flexShrink: 0 }} />

        <main style={{ flex: 1, overflowY: "auto", background: "#080C14", padding: "40px 48px" }}>

          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 36, fontWeight: 200, color: "#F0EDE8", lineHeight: 1 }}>Settings.</div>
            <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B7A99", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 6 }}>Azure Residences — Account & Preferences</div>
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg,#D4AF72,transparent)", margin: "16px 0 24px" }} />

          <motion.div
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            style={{
              background: "linear-gradient(135deg, rgba(212,175,114,0.06) 0%, rgba(15,22,35,1) 60%)",
              border: "1px solid #1C2333",
              borderLeft: "3px solid #D4AF72",
              padding: "32px 36px",
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, color: "#6B7A99", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>PROPERTY</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 38, fontWeight: 200, color: "#F0EDE8", lineHeight: 1, marginBottom: 6 }}>Azure Residences</div>
              <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#6B7A99", marginBottom: 16 }}>Collins Avenue, Miami Beach, FL</div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B7A99" }}>Est. 2024</span>
                <div style={{ width: 1, height: 12, background: "rgba(212,175,114,0.3)" }} />
                <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B7A99" }}>24 Residences</span>
                <div style={{ width: 1, height: 12, background: "rgba(212,175,114,0.3)" }} />
                <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#D4AF72" }}>Building Administrator</span>
              </div>
            </div>

            <div style={{ width: 1, height: 80, background: "rgba(212,175,114,0.12)", alignSelf: "center" }} />

            <div style={{ flexShrink: 0, marginLeft: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 28, fontWeight: 500, color: "#4ADE80" }}>20</div>
                <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 8, color: "#6B7A99", textTransform: "uppercase", marginTop: 4 }}>OCCUPIED</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 28, fontWeight: 500, color: "#6B7A99" }}>4</div>
                <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 8, color: "#6B7A99", textTransform: "uppercase", marginTop: 4 }}>VACANT</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 28, fontWeight: 500, color: "#F59E0B" }}>5</div>
                <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 8, color: "#6B7A99", textTransform: "uppercase", marginTop: 4 }}>EXPIRING</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 24, fontWeight: 500, color: "#F0EDE8" }}>$260K</div>
                <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 8, color: "#6B7A99", textTransform: "uppercase", marginTop: 4 }}>MONTHLY</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
            style={{ background: "#0F1623", border: "1px solid #1C2333", padding: 24, marginBottom: 20 }}
          >
            <SectionLabel>BUILDING PROFILE</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #1C2333" }}>
              {profileCells.map((cell, i) => {
                const isLastRow = i >= 4;
                const isRightCol = i % 2 === 1;
                return (
                  <div
                    key={cell.label}
                    style={{
                      padding: "14px 20px",
                      borderRight: isRightCol ? "none" : "1px solid #1C2333",
                      borderBottom: isLastRow ? "none" : "1px solid #1C2333",
                    }}
                  >
                    <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 8, color: "#6B7A99", textTransform: "uppercase", letterSpacing: "0.1em" }}>{cell.label}</div>
                    <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#F0EDE8", fontWeight: 500, marginTop: 4 }}>{cell.value}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}
          >
            <div style={{ background: "#0F1623", border: "1px solid #1C2333", padding: 24 }}>
              <SectionLabel>MY ACCOUNT</SectionLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #1C2333" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#D4AF72,#B8962F)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#080C14" }}>PM</span>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 15, color: "#F0EDE8", fontWeight: 500 }}>Property Manager</div>
                  <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B7A99", marginTop: 2 }}>Building Administrator</div>
                </div>
              </div>
              <AccountRow label="EMAIL"        value="manager@azureresidences.com" />
              <AccountRow label="ROLE"         value="Building Administrator" />
              <AccountRow label="ACCESS LEVEL" value="Full Access" />
              <AccountRow label="LAST LOGIN"   value="Today, May 20, 2026" last />
            </div>

            <div style={{ background: "#0F1623", border: "1px solid #1C2333", padding: 24 }}>
              <SectionLabel>BUILDING STATISTICS</SectionLabel>
              <StatRow label="TOTAL UNITS"     value={24} color="#F0EDE8" />
              <StatRow label="OCCUPIED"        value={20} color="#4ADE80" />
              <StatRow label="EXPIRING LEASES" value={5}  color="#F59E0B" />
              <StatRow label="OPEN WORK ORDERS" value={8} color="#F87171" last />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ background: "#0F1623", border: "1px solid #1C2333", padding: 24, marginBottom: 20 }}
          >
            <SectionLabel>NOTIFICATION PREFERENCES</SectionLabel>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 12, color: "#6B7A99", lineHeight: 1.6, margin: "0 0 20px" }}>
              Configure which alerts you receive for Azure Residences.
            </p>
            {notifRows.map((row, i) => (
              <div
                key={row.key}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: i === notifRows.length - 1 ? "none" : "1px solid #1C2333" }}
              >
                <div>
                  <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#F0EDE8", fontWeight: 500 }}>{row.title}</div>
                  <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B7A99", marginTop: 3 }}>{row.description}</div>
                </div>
                <Toggle on={notifications[row.key]} onToggle={() => toggle(row.key)} />
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ background: "#0F1623", border: "1px solid rgba(248,113,113,0.2)", padding: 24 }}
          >
            <SectionLabel>SESSION</SectionLabel>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 14, color: "#F0EDE8", fontWeight: 500 }}>Sign Out</div>
                <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B7A99", marginTop: 3 }}>You will be returned to the login screen.</div>
              </div>
              <button
                onClick={() => router.push("/")}
                style={{ background: "transparent", border: "1px solid rgba(248,113,113,0.4)", color: "#F87171", padding: "10px 24px", fontSize: 10, fontFamily: "var(--font-dm-sans)", textTransform: "uppercase", letterSpacing: "0.15em", borderRadius: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s, border-color 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.06)"; e.currentTarget.style.borderColor = "#F87171"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)"; }}
              >
                <LogOut size={14} />
                SIGN OUT
              </button>
            </div>
          </motion.div>

        </main>
      </div>
    </motion.div>
  );
}
