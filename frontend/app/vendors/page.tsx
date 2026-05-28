"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Clock } from "lucide-react";
import Sidebar from "@/components/Sidebar";

interface Vendor {
  id: string;
  name: string;
  specialty: string;
  contact_name: string;
  phone: string;
  email: string;
  rate_per_hour: number;
  available: boolean;
  rating: number;
  response_time_hours: number;
}

const SPECIALTIES = ["All", "HVAC", "Plumbing", "Electrical", "General"];

const SPECIALTY_COLOR: Record<string, string> = {
  HVAC: "#3B82F6",
  Plumbing: "#06B6D4",
  Electrical: "#F59E0B",
  General: "#6B7A99",
  Concierge: "#8B5CF6",
  Landscaping: "#4ADE80",
  Security: "#F87171",
  Cleaning: "#EC4899",
  Elevator: "#D4AF72",
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

function StarRating({ rating }: { rating: number }) {
  return (
    <span>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < Math.round(rating) ? "#D4AF72" : "#1C2333", fontSize: 14 }}>★</span>
      ))}
      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B7A99", marginLeft: 6 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSpecialty, setActiveSpecialty] = useState("All");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/vendors`)
      .then((r) => r.json())
      .then((data) => { setVendors(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const allSpecialties = ["All", ...Array.from(new Set(vendors.map((v) => v.specialty))).sort()];

  const filtered = vendors.filter(
    (v) => activeSpecialty === "All" || v.specialty === activeSpecialty
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ minHeight: "100vh", background: "#080C14" }}>
      <TopBar />
      <BottomBar />
      <Sidebar />

      <div style={{ position: "absolute", top: 40, bottom: 40, left: 0, right: 0, display: "flex", overflow: "hidden" }}>
        <div className="hidden lg:block" style={{ width: 240, flexShrink: 0 }} />

        <main className="px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10" style={{ flex: 1, overflowY: "auto", background: "#080C14" }}>
          <div style={{ marginBottom: 8 }}>
            <div className="text-[26px] md:text-[36px]" style={{ fontFamily: "Georgia, serif", fontWeight: 200, color: "#F0EDE8", lineHeight: 1 }}>Vendors.</div>
            <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B7A99", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 6 }}>Azure Residences — Contractor Network</div>
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg,#D4AF72,transparent)", marginBottom: 24, marginTop: 16 }} />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {(loading ? SPECIALTIES : allSpecialties).map((spec) => {
              const isActive = activeSpecialty === spec;
              return (
                <button
                  key={spec}
                  onClick={() => setActiveSpecialty(spec)}
                  style={{
                    fontFamily: "var(--font-dm-sans)", fontSize: 11, padding: "6px 16px",
                    border: `1px solid ${isActive ? "#D4AF72" : "#1C2333"}`,
                    color: isActive ? "#D4AF72" : "#6B7A99",
                    background: isActive ? "rgba(212,175,114,0.05)" : "transparent",
                    cursor: "pointer", borderRadius: 0, transition: "all 0.15s",
                  }}
                >
                  {spec}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 220, borderRadius: 0 }} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={activeSpecialty} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((vendor, i) => {
                  const topColor = SPECIALTY_COLOR[vendor.specialty] ?? "#6B7A99";
                  return (
                    <motion.div
                      key={vendor.id}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.06 }}
                      style={{
                        background: "#0F1623",
                        border: "1px solid #1C2333",
                        borderTop: `2px solid ${topColor}`,
                        padding: 24,
                        opacity: vendor.available ? 1 : 0.5,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 8, color: topColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          {vendor.specialty}
                        </span>
                        <span style={{
                          fontFamily: "var(--font-dm-sans)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", padding: "3px 8px",
                          color: vendor.available ? "#4ADE80" : "#F87171",
                          background: vendor.available ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                        }}>
                          {vendor.available ? "AVAILABLE" : "UNAVAILABLE"}
                        </span>
                      </div>

                      <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#F0EDE8", fontWeight: 400, marginTop: 12 }}>
                        {vendor.name}
                      </div>
                      <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 12, color: "#6B7A99", marginTop: 4 }}>
                        {vendor.contact_name}
                      </div>

                      <div style={{ height: 1, background: "#1C2333", margin: "14px 0" }} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <StarRating rating={vendor.rating} />
                        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#F0EDE8" }}>
                          ${vendor.rate_per_hour}/hr
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Phone size={11} color="#6B7A99" />
                          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B7A99" }}>{vendor.phone}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Clock size={11} color="#6B7A99" />
                          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B7A99" }}>~{vendor.response_time_hours}h response</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {filtered.length === 0 && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 0", fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#6B7A99" }}>
                    No vendors in this specialty.
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
