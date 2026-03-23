"use client";

import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { FinancialGoal } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  Trash2,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const statusConfig: Record<
  FinancialGoal["status"],
  { label: string; color: string; bg: string }
> = {
  active: { label: "Active", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  completed: { label: "Completed", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  paused: { label: "Paused", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
};

export default function GoalsPage() {
  const { goals, updateGoalStatus, deleteGoal, loaded } = useFinancialGoals();

  if (!loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          Financial Goals
        </h1>
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No goals yet
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Chat with your financial advisor to set meaningful financial goals.
            The advisor can help you define targets and timelines.
          </p>
          <Link href="/dashboard/chat">
            <Button>
              <MessageCircle className="mr-2 h-4 w-4" />
              Talk to Financial Advisor
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status === "active");
  const pausedGoals = goals.filter((g) => g.status === "paused");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const sortedGoals = [...activeGoals, ...pausedGoals, ...completedGoals];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Financial Goals
          </h1>
          <p className="mt-1 text-muted-foreground">
            {activeGoals.length} active, {completedGoals.length} completed,{" "}
            {pausedGoals.length} paused
          </p>
        </div>
        <Link href="/dashboard/chat">
          <Button variant="outline" size="sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            Set New Goal
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {sortedGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onStatusChange={updateGoalStatus}
            onDelete={deleteGoal}
          />
        ))}
      </div>
    </div>
  );
}

function GoalCard({
  goal,
  onStatusChange,
  onDelete,
}: {
  goal: FinancialGoal;
  onStatusChange: (id: string, status: FinancialGoal["status"]) => void;
  onDelete: (id: string) => void;
}) {
  const config = statusConfig[goal.status];

  return (
    <Card
      className={`p-6 transition-all ${goal.status === "completed" ? "opacity-75" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3
              className={`text-lg font-semibold text-foreground ${
                goal.status === "completed" ? "line-through" : ""
              }`}
            >
              {goal.title}
            </h3>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}
            >
              {config.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {goal.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {goal.targetAmount && (
              <span>
                Target: <span className="font-medium text-foreground">{formatCurrency(goal.targetAmount)}</span>
              </span>
            )}
            {goal.targetDate && (
              <span>
                By: <span className="font-medium text-foreground">{goal.targetDate}</span>
              </span>
            )}
            <span>
              Created:{" "}
              <span className="font-medium text-foreground">
                {new Date(goal.createdAt).toLocaleDateString("en-IN")}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {goal.status === "active" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => onStatusChange(goal.id, "completed")}
                title="Mark Complete"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => onStatusChange(goal.id, "paused")}
                title="Pause"
              >
                <PauseCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          {goal.status === "paused" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={() => onStatusChange(goal.id, "active")}
              title="Resume"
            >
              <PlayCircle className="h-4 w-4" />
            </Button>
          )}
          {goal.status === "completed" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={() => onStatusChange(goal.id, "active")}
              title="Reactivate"
            >
              <PlayCircle className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(goal.id)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
