"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";

const PARTICLES = [
  { left: "8%",  bottom: "45%", xVals: [0,  15, 0] as [number, number, number], dur: 14, delay: 0 },
  { left: "15%", bottom: "20%", xVals: [0, -18, 0] as [number, number, number], dur: 18, delay: 2 },
  { left: "22%", bottom: "55%", xVals: [0,  10, 0] as [number, number, number], dur: 16, delay: 4 },
  { left: "28%", bottom: "30%", xVals: [0, -12, 0] as [number, number, number], dur: 20, delay: 1 },
  { left: "35%", bottom: "15%", xVals: [0,  20, 0] as [number, number, number], dur: 13, delay: 6 },
  { left: "12%", bottom: "40%", xVals: [0,  -8, 0] as [number, number, number], dur: 17, delay: 3 },
];

const loginContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const loginItem = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

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

function Divider() {
  return (
    <div
      style={{
        width: 1,
        height: 12,
        background: "rgba(212,175,114,0.3)",
      }}
    />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rawX = useTransform(mouseX, [0, 1], [12, -12]);
  const rawY = useTransform(mouseY, [0, 1], [8, -8]);
  const springX = useSpring(rawX, { stiffness: 40, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 40, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    mouseX.set(e.clientX / window.innerWidth);
    mouseY.set(e.clientY / window.innerHeight);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        overflowX: "hidden",
        background: "#080C14",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{
          position: "absolute",
          inset: -24,
          x: springX,
          y: springY,
          overflow: "hidden",
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1758448617677-2f8bebc56d9e?w=1920&q=90"
          alt=""
          className="ken-burns"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />
      </motion.div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8,12,20,0.55)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(8,12,20,0.1) 0%, rgba(8,12,20,0.65) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "70%",
          background:
            "linear-gradient(to top, rgba(8,12,20,0.98) 0%, rgba(8,12,20,0.8) 30%, rgba(8,12,20,0.4) 60%, transparent 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "20%",
          background:
            "linear-gradient(to bottom, rgba(8,12,20,0.7) 0%, transparent 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 80,
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(212,175,114,0.04), transparent)",
          transform: "skewX(-15deg)",
          animation: "goldSweep 8s ease-in-out infinite",
          animationDelay: "3s",
          top: 0,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 40,
          background: "rgba(8,12,20,0.8)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(212,175,114,0.1)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="gap-2 md:gap-4 px-3"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          background: "rgba(8,12,20,0.8)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(212,175,114,0.1)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, color: "#6B7A99", letterSpacing: "0.2em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
          Azure Residences
        </span>
        <Divider />
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, color: "#6B7A99", letterSpacing: "0.15em", whiteSpace: "nowrap" }}>
          EST. 2024
        </span>
        <span className="hidden md:contents">
          <Divider />
          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, color: "#6B7A99", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
            Collins Avenue · Miami Beach
          </span>
        </span>
      </motion.div>

      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: p.left,
            bottom: p.bottom,
            width: 2,
            height: 2,
            borderRadius: "50%",
            background: "#D4AF72",
            pointerEvents: "none",
            zIndex: 5,
          }}
          animate={{
            y: [0, -180, -360],
            x: p.xVals,
            opacity: [0, 0.25, 0],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute z-10 left-4 right-4 bottom-16 lg:left-20 lg:right-auto lg:bottom-20 lg:w-[360px]"
      >
        <motion.form
          variants={loginContainer}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <motion.div variants={loginItem} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }} style={{ marginBottom: 16 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid rgba(212,175,114,0.5)",
                background: "rgba(8,12,20,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Georgia, serif",
                fontSize: 13,
                color: "#D4AF72",
                fontWeight: 400,
              }}
            >
              EM
            </div>
          </motion.div>

          <motion.div variants={loginItem} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }} style={{ marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: "#D4AF72" }} />
          </motion.div>

          <motion.div variants={loginItem} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }} style={{ marginBottom: 4 }}>
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 10,
                color: "#D4AF72",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
              }}
            >
              AZURE
            </div>
          </motion.div>

          <motion.div variants={loginItem} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }} style={{ marginBottom: 8 }}>
            <div
              className="text-[32px] md:text-[42px]"
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: 200,
                color: "#F0EDE8",
                letterSpacing: "0.02em",
                lineHeight: 1,
              }}
            >
              RESIDENCES
            </div>
          </motion.div>

          <motion.div variants={loginItem} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }} style={{ marginBottom: 36 }}>
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 9,
                color: "#6B7A99",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              Property Intelligence
            </span>
          </motion.div>

          <motion.div variants={loginItem} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }} style={{ marginBottom: 8 }}>
            <label
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 9,
                color: "#6B7A99",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                display: "block",
              }}
            >
              Email Address
            </label>
          </motion.div>

          <motion.div variants={loginItem} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }} style={{ marginBottom: 20 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="em-input"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(212,175,114,0.35)",
                padding: "14px 0",
                color: "#F0EDE8",
                fontSize: 13,
                fontFamily: "var(--font-dm-sans)",
                outline: "none",
                transition: "border-color 0.3s ease",
                minHeight: 44,
              }}
            />
          </motion.div>

          <motion.div variants={loginItem} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }} style={{ marginBottom: 8 }}>
            <label
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 9,
                color: "#6B7A99",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                display: "block",
              }}
            >
              Password
            </label>
          </motion.div>

          <motion.div variants={loginItem} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }} style={{ marginBottom: 32 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="em-input"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(212,175,114,0.35)",
                padding: "14px 0",
                color: "#F0EDE8",
                fontSize: 13,
                fontFamily: "var(--font-dm-sans)",
                outline: "none",
                transition: "border-color 0.3s ease",
                minHeight: 44,
              }}
            />
          </motion.div>

          <motion.div variants={loginItem} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}>
            <button
              type="submit"
              className="sign-in-btn"
              style={{
                width: "100%",
                background: "#C9A84C",
                color: "#080C14",
                fontSize: 11,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                fontWeight: 500,
                fontFamily: "var(--font-dm-sans)",
                padding: 15,
                border: "none",
                borderRadius: 0,
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#B8962F")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#C9A84C")
              }
            >
              Sign In
              <span className="sign-in-shimmer" aria-hidden="true" />
            </button>
          </motion.div>

          <motion.div variants={loginItem} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }} style={{ marginTop: 12 }}>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 9,
                color: "#6B7A99",
                opacity: 0.5,
                textAlign: "left",
              }}
            >
              Secure access for authorized personnel only
            </p>
          </motion.div>
        </motion.form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="hidden lg:block"
        style={{
          position: "absolute",
          bottom: 80,
          right: 60,
          width: 220,
          zIndex: 10,
        }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: "rgba(8,12,20,0.6)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(212,175,114,0.12)",
            borderTop: "1px solid rgba(212,175,114,0.4)",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 9,
              color: "#D4AF72",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            24 Residences
          </div>
          <div
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 12,
              color: "#F0EDE8",
              marginTop: 4,
            }}
          >
            Collins Avenue, Miami Beach
          </div>

          <div
            style={{
              height: 1,
              background: "rgba(212,175,114,0.15)",
              margin: "12px 0",
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 8,
                color: "#6B7A99",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Occupancy
            </span>
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 18,
                color: "#4ADE80",
                fontWeight: 500,
              }}
            >
              91.7%
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 8,
                color: "#6B7A99",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Avg Lease
            </span>
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 13,
                color: "#F0EDE8",
              }}
            >
              $14,200/mo
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 8,
                color: "#6B7A99",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Open Tickets
            </span>
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 13,
                color: "#F59E0B",
                fontWeight: 500,
              }}
            >
              7
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
