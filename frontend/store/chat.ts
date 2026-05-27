import { create } from "zustand";
import { ChatResponse, HistoryItem } from "@/lib/types";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: ChatResponse | string;
  timestamp: Date;
}

interface ChatStore {
  messages: Message[];
  loading: boolean;
  addMessage: (m: Message) => void;
  setLoading: (v: boolean) => void;
  reset: () => void;
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: {
    text: "Good morning. I'm EM, your property intelligence assistant for Azure Residences. I have full access to tenant records, lease agreements, maintenance requests, and vendor contacts. How can I assist you today?",
    table: null,
    draft_email: null,
    action_items: null,
  },
  timestamp: new Date(),
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [WELCOME],
  loading: false,
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setLoading: (v) => set({ loading: v }),
  reset: () => set({ messages: [WELCOME], loading: false }),
}));

export function messagesToHistory(messages: Message[]): HistoryItem[] {
  return messages
    .filter((m) => m.id !== "welcome")
    .map((m) => ({
      role: m.role,
      content:
        typeof m.content === "string"
          ? m.content
          : (m.content as ChatResponse).text,
    }));
}
