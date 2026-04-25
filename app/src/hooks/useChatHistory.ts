"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChatMessage } from "@/types";

const LEGACY_STORAGE_KEY = "financial-chat-history";

export function useChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Tracks the DB-assigned ID for the assistant message currently being streamed
  const currentAssistantDbId = useRef<string | null>(null);
  // Tracks the latest messages for use in debounced save
  const messagesRef = useRef<ChatMessage[]>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    fetch("/api/chat/messages")
      .then((r) => r.json())
      .then(async (data) => {
        const dbMessages: ChatMessage[] = data.messages ?? [];

        if (dbMessages.length > 0) {
          setMessages(dbMessages);
        } else {
          // Migrate from localStorage if DB is empty
          try {
            const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
            if (stored) {
              const local = JSON.parse(stored) as ChatMessage[];
              if (local.length > 0) {
                await fetch("/api/chat/messages", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(local),
                });
                const res2 = await fetch("/api/chat/messages");
                const data2 = await res2.json();
                setMessages(data2.messages ?? []);
                localStorage.removeItem(LEGACY_STORAGE_KEY);
                return;
              }
            }
          } catch {
            // ignore
          }
          setMessages(dbMessages);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);

    fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: message.role, content: message.content }),
    })
      .then((r) => r.json())
      .then((res) => {
        const serverMsg: ChatMessage = res.messages?.[0];
        if (serverMsg) {
          if (message.role === "assistant") {
            currentAssistantDbId.current = serverMsg.id;
          }
          setMessages((prev) =>
            prev.map((m) => (m.id === message.id ? { ...m, id: serverMsg.id } : m))
          );
        }
      })
      .catch(() => {});
  }, []);

  const updateLastAssistantMessage = useCallback((contentChunk: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "assistant") {
        return [...prev.slice(0, -1), { ...last, content: last.content + contentChunk }];
      }
      return prev;
    });

    // Debounce: persist final content to DB 1.5s after streaming stops
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const dbId = currentAssistantDbId.current;
      if (!dbId) return;
      const last = messagesRef.current[messagesRef.current.length - 1];
      if (last && last.role === "assistant") {
        fetch(`/api/chat/messages/${dbId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: last.content }),
        }).catch(() => {});
      }
    }, 1500);
  }, []);

  const setGoalOnMessage = useCallback(
    (messageId: string, goal: ChatMessage["suggestedGoal"]) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, suggestedGoal: goal } : m))
      );
      fetch(`/api/chat/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestedGoal: goal }),
      }).catch(() => {});
    },
    []
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    currentAssistantDbId.current = null;
    fetch("/api/chat/messages", { method: "DELETE" }).catch(() => {});
  }, []);

  return {
    messages,
    addMessage,
    updateLastAssistantMessage,
    setGoalOnMessage,
    clearHistory,
    loaded,
  };
}
