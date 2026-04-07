"use client";

import { useState, useRef, useEffect } from "react";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { ChatMessage, FinancialGoal } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { Send, MessageCircle, RotateCcw, Target } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

function extractGoalFromContent(content: string): {
  cleanContent: string;
  goal: Omit<FinancialGoal, "id" | "createdAt" | "status"> | null;
} {
  const goalRegex =
    /\|\|\|GOAL\|\|\|([\s\S]*?)\|\|\|END_GOAL\|\|\|/;
  const match = content.match(goalRegex);

  if (!match) {
    return { cleanContent: content, goal: null };
  }

  const cleanContent = content.replace(goalRegex, "").trim();
  try {
    const parsed = JSON.parse(match[1]);
    return {
      cleanContent,
      goal: {
        title: String(parsed.title ?? ""),
        description: String(parsed.description ?? ""),
        targetAmount: parsed.targetAmount
          ? Number(parsed.targetAmount)
          : undefined,
        targetDate: parsed.targetDate ? String(parsed.targetDate) : undefined,
      },
    };
  } catch {
    return { cleanContent, goal: null };
  }
}

export default function ChatPage() {
  const {
    messages,
    addMessage,
    updateLastAssistantMessage,
    setGoalOnMessage,
    clearHistory,
    loaded: chatLoaded,
  } = useChatHistory();
  const { snapshots, loaded: historyLoaded } = useNetWorthHistory();
  const { addGoal } = useFinancialGoals();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [savedGoalIds, setSavedGoalIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!chatLoaded || !historyLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  function getSnapshotSummary(): string | undefined {
    if (snapshots.length === 0) return undefined;
    const latest = snapshots[snapshots.length - 1];
    return `As of ${latest.date}: Total Assets: ₹${latest.totalAssets.toLocaleString("en-IN")}, Total Liabilities: ₹${latest.totalLiabilities.toLocaleString("en-IN")}, Net Worth: ₹${latest.netWorth.toLocaleString("en-IN")}`;
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);
    setInput("");

    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    addMessage(assistantMessage);
    setIsStreaming(true);

    try {
      const chatMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: trimmed },
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatMessages,
          snapshotSummary: getSnapshotSummary(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Chat request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                updateLastAssistantMessage(parsed.content);
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }

      const { goal } = extractGoalFromContent(fullContent);
      if (goal) {
        setGoalOnMessage(assistantMessage.id, goal);
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Something went wrong";
      updateLastAssistantMessage(`\n\n_Error: ${errMsg}_`);
    } finally {
      setIsStreaming(false);
    }
  }

  function handleSaveGoal(messageId: string, goal: ChatMessage["suggestedGoal"]) {
    if (!goal) return;
    addGoal({
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate,
    });
    setSavedGoalIds((prev) => new Set(prev).add(messageId));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <DashboardPageShell variant="wide" className="py-6">
      <div className="flex flex-col gap-4" style={{ height: "calc(100vh - 73px)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-semibold text-brand-gradient">
              Financial Advisor
            </h1>
            <p className="text-sm text-muted-foreground">
              Chat with your AI financial advisor
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            disabled={isStreaming || messages.length === 0}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        </div>

        <Card className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Start a conversation
                </h2>
                <p className="text-muted-foreground max-w-sm">
                  Ask about wealth building, financial planning, debt management,
                  or get help setting financial goals.
                </p>
              </div>
            )}
            {messages.map((msg) => {
              const content =
                msg.role === "assistant"
                  ? extractGoalFromContent(msg.content).cleanContent
                  : msg.content;

              return (
                <div key={msg.id}>
                  <div
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{content}</div>
                    </div>
                  </div>
                  {msg.role === "assistant" && msg.suggestedGoal && (
                    <div className="ml-2 mt-2">
                      <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                        <Target className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">
                          Goal: {msg.suggestedGoal.title}
                        </span>
                        {savedGoalIds.has(msg.id) ? (
                          <span className="text-xs text-emerald-600 font-medium">
                            Saved!
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                            onClick={() => handleSaveGoal(msg.id, msg.suggestedGoal)}
                          >
                            Save as Goal
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your finances..."
                rows={1}
                className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                disabled={isStreaming}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="h-auto rounded-xl px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardPageShell>
  );
}
