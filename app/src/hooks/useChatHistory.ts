"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatMessage } from "@/types";

const STORAGE_KEY = "financial-chat-history";

export function useChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as ChatMessage[];
      }
    } catch {
      // ignore parse errors
    }
    return [];
  });

  const loaded = typeof window !== "undefined";

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, loaded]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateLastAssistantMessage = useCallback(
    (contentChunk: string) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + contentChunk },
          ];
        }
        return prev;
      });
    },
    []
  );

  const setGoalOnMessage = useCallback(
    (
      messageId: string,
      goal: ChatMessage["suggestedGoal"]
    ) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, suggestedGoal: goal } : m
        )
      );
    },
    []
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
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
