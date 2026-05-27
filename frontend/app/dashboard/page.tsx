"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Wrench, FileWarning, DollarSign } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { fetchDashboard } from "@/lib/api";
import { DashboardResponse, MaintenanceRecord, ExpiringLease } from "@/lib/types";

function useCountUp(target: number, duration = 1500, delay = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (target === 0) return;
    timerRef.current = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        setValue(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return value;
}

function LiveClock() {
  const [time, setTime] = useState("00:00:00");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: "monospace", fontSize: 9, color: "#6B7A99", letterSpacing: "0.1em" }}>
      {time}
    </span>
  );
}

function BarDivider() {
  return (
    <div style={{ width: 1, height: 14, background: "rgba(212,175,114,0.25)", flexShrink: 0 }} />
  );
}

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  urgent: { bg: "rgba(248,113,113,0.12)", color: "#F87171" },
  high:   { bg: "rgba(245,158,11,0.12)",  color: "#F59E0B" },
  medium: { bg: "rgba(107,122,153,0.12)", color: "#6B7A99" },
  low:    { bg: "rgba(74,222,128,0.12)",  color: "#4ADE80" },
};

function StatCard({
  label,
  icon: Icon,
  display,
  valueFontSize = 44,
  color,
  subLabel,
  delay,
}: {
  label: string;
  icon: React.ElementType;
  display: string;
  valueFontSize?: number;
  color: string;
  subLabel: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0, 0, 0.2, 1] }}
      style={{
        background: "#0F1623",
        border: "1px solid #1C2333",
        borderTop: "2px solid rgba(212,175,114,0.15)",
        padding: "28px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          background: "radial-gradient(circle at top right, rgba(212,175,114,0.05), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Icon size={20} color="#D4AF72" style={{ marginBottom: 16, display: "block" }} />

      <div
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 9,
          color: "#6B7A99",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: valueFontSize,
          fontWeight: 500,
          lineHeight: 1,
          color,
        }}
      >
        {display}
      </div>

      <div
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 10,
          color: "#6B7A99",
          marginTop: 8,
        }}
      >
        {subLabel}
      </div>
    </motion.div>
  );
}

function PanelHeader({
  title,
  badge,
  badgeColor,
}: {
  title: string;
  badge: string;
  badgeColor: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: "1px solid #1C2333",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 9,
          color: "#6B7A99",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 9,
          color: badgeColor,
          background: `${badgeColor}1a`,
          padding: "3px 8px",
          letterSpacing: "0.05em",
        }}
      >
        {badge}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [warming, setWarming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const MAX_ATTEMPTS = 10;
    const RETRY_DELAY_MS = 5000;

    (async () => {
      setError(null);
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          const result = await fetchDashboard();
          if (cancelled) return;
          setData(result);
          setWarming(false);
          setError(null);
          setLoading(false);
          return;
        } catch (err) {
          if (cancelled) return;
          if (attempt === MAX_ATTEMPTS) {
            setWarming(false);
            setError("Backend is taking longer than usual to wake up. Refresh to try again.");
            setLoading(false);
            return;
          }
          setWarming(true);
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = data?.stats;
  const maintenance = data?.recent_maintenance ?? [];
  const leases = data?.expiring_leases ?? [];

  const urgentCount = maintenance.filter((m) => m.priority === "urgent").length;
  const highCount   = maintenance.filter((m) => m.priority === "high").length;

  const occupancyVal = useCountUp(stats?.occupancy_rate       ?? 0, 1500,   0);
  const openVal      = useCountUp(maintenance.length,               1500,  80);
  const expiringVal  = useCountUp(stats?.expiring_soon        ?? 0, 1500, 160);
  const revenueVal   = useCountUp(stats?.total_monthly_revenue ?? 0, 1500, 240);

  const occupancyColor =
    occupancyVal >= 90 ? "#4ADE80" : occupancyVal >= 80 ? "#F59E0B" : "#F87171";

  return (
    <div style={{ minHeight: "100vh", background: "#080C14" }}>
      <Sidebar />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 40,
          background: "rgba(8,12,20,0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(212,175,114,0.1)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#4ADE80",
              animation: "statusPulse 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 9,
              color: "#6B7A99",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            System Online
          </span>
        </div>
        <LiveClock />
      </motion.div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          background: "rgba(8,12,20,0.95)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(212,175,114,0.1)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, color: "#6B7A99", letterSpacing: "0.2em", textTransform: "uppercase" }}>Azure Residences</span>
        <BarDivider />
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, color: "#6B7A99", letterSpacing: "0.15em" }}>EST. 2024</span>
        <BarDivider />
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, color: "#6B7A99", letterSpacing: "0.1em" }}>Collins Avenue · Miami Beach</span>
      </div>

      <main
        style={{
          paddingTop: 64,
          paddingBottom: 104,
          paddingLeft: 288,
          paddingRight: 48,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0, 0, 0.2, 1] }}
          style={{ marginBottom: 40 }}
        >
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 40,
              fontWeight: 200,
              color: "#F0EDE8",
              letterSpacing: "-0.01em",
              marginBottom: 8,
            }}
          >
            Good morning.
          </h1>
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 11,
              color: "#6B7A99",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Azure Residences — Property Intelligence
          </p>
          <div
            style={{
              marginTop: 20,
              height: 1,
              width: 200,
              background: "linear-gradient(to right, rgba(212,175,114,0.4), rgba(212,175,114,0.1), transparent)",
            }}
          />
        </motion.div>

        {warming && !error && (
          <div
            style={{
              background: "rgba(212,175,114,0.06)",
              border: "1px solid rgba(212,175,114,0.25)",
              color: "#D4AF72",
              fontSize: 12,
              padding: "10px 16px",
              marginBottom: 32,
              fontFamily: "var(--font-dm-sans)",
              lineHeight: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: "1.5px solid rgba(212,175,114,0.3)",
                borderTopColor: "#D4AF72",
                animation: "spin 0.8s linear infinite",
                display: "inline-block",
              }}
            />
            System warming up, please wait…
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              color: "#F87171",
              fontSize: 12,
              padding: "10px 16px",
              marginBottom: 32,
              fontFamily: "var(--font-dm-sans)",
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {loading ? (
            [0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 160, border: "1px solid #1C2333" }}
              />
            ))
          ) : (
            <>
              <StatCard
                label="Occupancy Rate"
                icon={Building2}
                display={`${occupancyVal.toFixed(1)}%`}
                color={occupancyColor}
                subLabel={`${stats?.occupied ?? 0} of ${stats?.total_units ?? 24} units occupied`}
                delay={0}
              />
              <StatCard
                label="Open Requests"
                icon={Wrench}
                display={`${Math.round(openVal)}`}
                color={openVal > 5 ? "#F87171" : "#F0EDE8"}
                subLabel={`${urgentCount} urgent · ${highCount} high priority`}
                delay={0.08}
              />
              <StatCard
                label="Expiring (30 Days)"
                icon={FileWarning}
                display={`${Math.round(expiringVal)}`}
                color="#F59E0B"
                subLabel="Action required this week"
                delay={0.16}
              />
              <StatCard
                label="Monthly Revenue"
                icon={DollarSign}
                display={new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(Math.round(revenueVal))}
                valueFontSize={36}
                color="#F0EDE8"
                subLabel={`Avg $${Math.round((stats?.total_monthly_revenue ?? 0) / (stats?.occupied || 1)).toLocaleString()} per unit`}
                delay={0.24}
              />
            </>
          )}
        </div>

        {!loading && !error && data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              alignItems: "start",
              gap: 20,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                background: "#0F1623",
                border: "1px solid #1C2333",
                padding: 24,
              }}
            >
              <PanelHeader
                title="Recent Maintenance"
                badge={`${maintenance.length} open`}
                badgeColor="#F87171"
              />

              {maintenance.length === 0 ? (
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 12, color: "#6B7A99" }}>
                  No open tickets.
                </p>
              ) : (
                maintenance.map((m: MaintenanceRecord, i) => {
                  const ps = PRIORITY_STYLE[m.priority] ?? PRIORITY_STYLE.medium;
                  const desc = m.description.length > 50
                    ? m.description.slice(0, 50) + "…"
                    : m.description;
                  const isLast = i === maintenance.length - 1;
                  return (
                    <div
                      key={m.id}
                      style={{
                        padding: "14px 0",
                        borderBottom: isLast ? "none" : "1px solid #1C2333",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: 7,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            background: ps.bg,
                            color: ps.color,
                            padding: "2px 6px",
                          }}
                        >
                          {m.priority}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: 12,
                            color: "#D4AF72",
                          }}
                        >
                          Unit {m.unit}
                        </span>
                      </div>

                      <p
                        style={{
                          fontFamily: "var(--font-dm-sans)",
                          fontSize: 13,
                          color: "#F0EDE8",
                          lineHeight: 1.4,
                          marginTop: 5,
                        }}
                      >
                        {desc}
                      </p>

                      <div style={{ display: "flex", gap: 12, marginTop: 5 }}>
                        <span
                          style={{
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: 9,
                            color: ps.color,
                            textTransform: "capitalize",
                          }}
                        >
                          {m.status.replace("_", " ")}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: 9,
                            color: "#6B7A99",
                          }}
                        >
                          {m.created_date}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div
              style={{
                background: "#0F1623",
                border: "1px solid #1C2333",
                padding: 24,
              }}
            >
              <PanelHeader
                title="Expiring Leases"
                badge={`${leases.length} lease${leases.length !== 1 ? "s" : ""}`}
                badgeColor="#F59E0B"
              />

              {leases.length === 0 ? (
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 12, color: "#6B7A99" }}>
                  No leases expiring soon.
                </p>
              ) : (
                leases.map((l: ExpiringLease, i) => {
                  const isLast = i === leases.length - 1;
                  const dayColor = l.days_remaining <= 14 ? "#F87171"
                    : l.days_remaining <= 30 ? "#F59E0B"
                    : "#6B7A99";
                  const dayBg = l.days_remaining <= 14 ? "rgba(248,113,113,0.15)"
                    : l.days_remaining <= 30 ? "rgba(245,158,11,0.15)"
                    : "rgba(107,122,153,0.15)";
                  return (
                    <div
                      key={l.tenant_id}
                      style={{
                        padding: "14px 0",
                        borderBottom: isLast ? "none" : "1px solid #1C2333",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: 13,
                            color: "#F0EDE8",
                            fontWeight: 500,
                          }}
                        >
                          {l.name}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: 10,
                            color: "#6B7A99",
                            marginTop: 3,
                          }}
                        >
                          Unit {l.unit} · {l.end_date}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            display: "block",
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: 9,
                            color: dayColor,
                            background: dayBg,
                            padding: "2px 8px",
                            marginBottom: 4,
                          }}
                        >
                          {l.days_remaining}d
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: 12,
                            color: "#D4AF72",
                          }}
                        >
                          ${l.monthly_rent.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {[
            { label: "LOG MAINTENANCE REQUEST", href: "/chat?prompt=Log+a+maintenance+ticket" },
            { label: "DRAFT RENEWAL EMAIL",      href: "/chat?prompt=Draft+a+renewal+email+for+an+expiring+tenant" },
          ].map(({ label, href }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 10,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#D4AF72",
                background: "transparent",
                border: "1px solid rgba(212,175,114,0.35)",
                borderRadius: 0,
                padding: "14px 24px",
                cursor: "pointer",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(212,175,114,0.04)";
                e.currentTarget.style.borderColor = "#D4AF72";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(212,175,114,0.35)";
              }}
            >
              {label}
            </button>
          ))}

          <div style={{ width: 1, height: 20, background: "rgba(212,175,114,0.2)" }} />

          <button
            onClick={() => router.push("/chat")}
            className="sign-in-btn"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 10,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 500,
              color: "#080C14",
              background: "#C9A84C",
              border: "none",
              borderRadius: 0,
              padding: "14px 32px",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#B8962F")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#C9A84C")}
          >
            ASK EM →
            <span className="sign-in-shimmer" aria-hidden="true" />
          </button>
        </div>
      </main>
    </div>
  );
}
