"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";

interface TableData { [key: string]: string | number }

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  table?: TableData[] | null;
  draft_email?: string | null;
  action_items?: string[] | null;
  timestamp: Date;
}

interface ChatResponse {
  text: string;
  table?: TableData[] | null;
  draft_email?: string | null;
  action_items?: string[] | null;
}

const CHIPS: { label: string; prompt: string }[] = [
  { label: "Expiring leases",  prompt: "Which leases expire in the next 60 days?" },
  { label: "Open maintenance", prompt: "Show me all open maintenance requests" },
  { label: "HVAC vendors",     prompt: "Which HVAC vendors are available right now?" },
  { label: "Occupancy stats",  prompt: "What is our current occupancy rate and revenue?" },
  { label: "Urgent tickets",   prompt: "Show me all urgent maintenance tickets" },
];

const WELCOME: Message = {
  id: "0",
  role: "assistant",
  content:
    "Good afternoon. I'm EM, your property intelligence assistant for Azure Residences. I have real-time access to all tenant records, lease agreements, maintenance requests, and vendor data. How can I assist you today?",
  table: null,
  draft_email: null,
  action_items: null,
  timestamp: new Date(),
};

function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(
        [now.getHours(), now.getMinutes(), now.getSeconds()]
          .map((n) => String(n).padStart(2, "0"))
          .join(":")
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: 9,
        color: "#6B7A99",
        letterSpacing: "0.08em",
      }}
    >
      {time}
    </span>
  );
}

function TopBar() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        background: "rgba(8,12,20,0.98)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(212,175,114,0.12)",
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
          SYSTEM ONLINE
        </span>
      </div>
      <LiveClock />
    </div>
  );
}

function BarDivider() {
  return (
    <div
      style={{
        width: 1,
        height: 14,
        background: "rgba(212,175,114,0.25)",
      }}
    />
  );
}

function BottomBar() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        background: "rgba(8,12,20,0.98)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(212,175,114,0.12)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      {["AZURE RESIDENCES", <BarDivider key="d1" />, "EST. 2024", <BarDivider key="d2" />, "COLLINS AVENUE · MIAMI BEACH"].map(
        (item, i) =>
          typeof item === "string" ? (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 9,
                color: "#6B7A99",
                letterSpacing: "0.12em",
              }}
            >
              {item}
            </span>
          ) : (
            item
          )
      )}
    </div>
  );
}

function ChatHeader() {
  return (
    <div
      style={{
        padding: "24px 32px 20px",
        borderBottom: "1px solid #1C2333",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 22,
          fontWeight: 200,
          color: "#F0EDE8",
          marginBottom: 4,
        }}
      >
        EM — Property Intelligence
      </div>
      <div
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 9,
          color: "#6B7A99",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
      >
        Azure Residences · AI Assistant
      </div>
    </div>
  );
}

function EMAvatar() {
  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: "#D4AF72",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: "Georgia, serif",
        fontSize: 12,
        fontWeight: 600,
        color: "#080C14",
        marginTop: 2,
      }}
    >
      EM
    </div>
  );
}

function LoadingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#D4AF72",
          }}
        />
      ))}
    </div>
  );
}

function ResponseTable({ rows }: { rows: TableData[] }) {
  if (!rows || rows.length === 0) return null;

  let headers: string[];
  let dataRows: string[][];

  if (Array.isArray(rows[0])) {
    const raw = rows as unknown as string[][];
    headers = raw[0].map(String);
    dataRows = raw.slice(1).map((r) => r.map(String));
  } else {
    headers = Object.keys(rows[0]);
    dataRows = (rows as TableData[]).map((r) => headers.map((h) => String(r[h] ?? "")));
  }

  return (
    <div style={{ overflowX: "auto", marginTop: 14 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#1C2333" }}>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: 8,
                  color: "#D4AF72",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "9px 12px",
                  fontWeight: 500,
                  textAlign: "left",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, i) => (
            <tr
              key={i}
              style={{
                background: i % 2 === 1 ? "rgba(255,255,255,0.01)" : "transparent",
              }}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: 12,
                    color: "#F0EDE8",
                    padding: "9px 12px",
                    borderBottom: i === dataRows.length - 1 ? "none" : "1px solid #1C2333",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DraftEmail({ body }: { body: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{
        marginTop: 14,
        background: "#0A1020",
        border: "1px solid rgba(212,175,114,0.2)",
        borderTop: "2px solid rgba(212,175,114,0.4)",
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: 8,
            color: "#D4AF72",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          DRAFT EMAIL
        </span>
        <button
          onClick={handleCopy}
          style={{
            border: "1px solid rgba(212,175,114,0.35)",
            color: "#D4AF72",
            background: "transparent",
            fontFamily: "var(--font-dm-sans)",
            fontSize: 8,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "4px 10px",
            cursor: "pointer",
            borderRadius: 0,
          }}
        >
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      <pre
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 12,
          color: "#6B7A99",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          lineHeight: 1.8,
          margin: 0,
        }}
      >
        {body}
      </pre>
    </div>
  );
}

function ActionItems({ items }: { items: string[] }) {
  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <CheckCircle size={15} color="#D4AF72" style={{ flexShrink: 0, marginTop: 1 }} />
          <span
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 12,
              color: "#F0EDE8",
              lineHeight: 1.5,
            }}
          >
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

function UserMessageBubble({ content }: { content: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div
        style={{
          background: "#1C2333",
          borderLeft: "2px solid #D4AF72",
          padding: "12px 16px",
          maxWidth: "60%",
          fontFamily: "var(--font-dm-sans)",
          fontSize: 13,
          color: "#F0EDE8",
          lineHeight: 1.5,
        }}
      >
        {content}
      </div>
    </div>
  );
}

function EMMessageBubble({ msg }: { msg: Message }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <EMAvatar />
      <div
        style={{
          background: "#0F1623",
          border: "1px solid #1C2333",
          borderTop: "1px solid rgba(212,175,114,0.15)",
          padding: "16px 20px",
          flex: 1,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: 13,
            color: "#F0EDE8",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {msg.content}
        </p>
        {msg.table && msg.table.length > 0 && <ResponseTable rows={msg.table} />}
        {msg.draft_email && <DraftEmail body={msg.draft_email} />}
        {msg.action_items && msg.action_items.length > 0 && (
          <ActionItems items={msg.action_items} />
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const history = messages
      .filter((m) => m.id !== "0")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      console.log("=== CHAT FETCH ===", `${apiUrl}/api/chat`);

      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);
      const rawText = await res.text();
      console.log("Raw response:", rawText);
      const data = JSON.parse(rawText) as ChatResponse;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_em",
          role: "assistant",
          content: data.text,
          table: data.table ?? null,
          draft_email: data.draft_email ?? null,
          action_items: data.action_items ?? null,
          timestamp: new Date(),
        },
      ]);
    } catch (error: unknown) {
      console.error("=== CHAT API ERROR ===");
      console.error("Error type:", typeof error);
      console.error("Error:", error);
      if (error instanceof Error) {
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_err",
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : String(error)}`,
          table: null,
          draft_email: null,
          action_items: null,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: "100vh", background: "#080C14" }}
    >
      <TopBar />
      <BottomBar />
      <Sidebar />

      <div
        style={{
          position: "absolute",
          top: 40,
          bottom: 40,
          left: 0,
          right: 0,
          display: "flex",
          overflow: "hidden",
        }}
      >
        <div style={{ width: 240, flexShrink: 0 }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "#080C14",
          }}
        >
          <ChatHeader />

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {msg.role === "user" ? (
                    <UserMessageBubble content={msg.content} />
                  ) : (
                    <EMMessageBubble msg={msg} />
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <EMAvatar />
                    <div
                      style={{
                        background: "#0F1623",
                        border: "1px solid #1C2333",
                        borderTop: "1px solid rgba(212,175,114,0.15)",
                        padding: "16px 20px",
                      }}
                    >
                      <LoadingDots />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          <div
            style={{
              flexShrink: 0,
              background: "#080C14",
              borderTop: "1px solid #1C2333",
            }}
          >
            <div style={{ padding: "12px 32px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => setInput(chip.prompt)}
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: 10,
                    color: "#6B7A99",
                    border: "1px solid #1C2333",
                    background: "transparent",
                    padding: "6px 14px",
                    cursor: "pointer",
                    borderRadius: 0,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#D4AF72";
                    e.currentTarget.style.color = "#D4AF72";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#1C2333";
                    e.currentTarget.style.color = "#6B7A99";
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div style={{ padding: "12px 32px 16px", display: "flex", gap: 12 }}>
              <input
                className="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask EM anything about Azure Residences..."
                style={{
                  flex: 1,
                  background: "#0F1623",
                  border: "1px solid #1C2333",
                  padding: "14px 18px",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: 13,
                  color: "#F0EDE8",
                  outline: "none",
                  borderRadius: 0,
                }}
                onFocus={(e) => (e.target.style.borderColor = "#D4AF72")}
                onBlur={(e) => (e.target.style.borderColor = "#1C2333")}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                style={{
                  background: !input.trim() || isLoading ? "#1C2333" : "#C9A84C",
                  color: "#080C14",
                  border: "none",
                  padding: "14px 24px",
                  borderRadius: 0,
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  fontWeight: 500,
                  cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  if (input.trim() && !isLoading)
                    e.currentTarget.style.background = "#B8962F";
                }}
                onMouseLeave={(e) => {
                  if (input.trim() && !isLoading)
                    e.currentTarget.style.background = "#C9A84C";
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
