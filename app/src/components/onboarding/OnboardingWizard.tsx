"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStatements } from "@/hooks/useStatements";
import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";
import { computeTotals } from "@/lib/computations";
import type { StatementEntry } from "@/types";
import { WelcomeStep, type OnboardingPath } from "./WelcomeStep";
import { BankSavingsStep } from "./BankSavingsStep";
import { DepositsStep } from "./DepositsStep";
import { InvestmentsStep } from "./InvestmentsStep";
import { PropertyStep } from "./PropertyStep";
import { LoansStep } from "./LoansStep";
import { CreditCardsStep } from "./CreditCardsStep";
import { SummaryStep } from "./SummaryStep";

// ---------------------------------------------------------------------------
// Step configuration
// ---------------------------------------------------------------------------

interface StepConfig {
  id: string;
  quickStart: boolean;
}

const STEPS: StepConfig[] = [
  { id: "welcome", quickStart: true },
  { id: "bank-savings", quickStart: true },
  { id: "deposits", quickStart: false },
  { id: "investments", quickStart: false },
  { id: "property", quickStart: false },
  { id: "loans", quickStart: true },
  { id: "credit-cards", quickStart: true },
  { id: "summary", quickStart: true },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface OnboardingWizardProps {
  firstName: string;
  onDismiss: () => void;
}

export function OnboardingWizard({
  firstName,
  onDismiss,
}: OnboardingWizardProps) {
  const { bulkAddStatements, deleteAllStatements } = useStatements();
  const { saveSnapshot } = useNetWorthHistory();

  const [path, setPath] = useState<OnboardingPath | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Entries keyed by step id
  const [stepEntries, setStepEntries] = useState<
    Record<string, Omit<StatementEntry, "id">[]>
  >({});

  // Filtered steps based on selected path
  const activeSteps = useMemo(() => {
    if (!path) return [STEPS[0]];
    if (path === "quick") return STEPS.filter((s) => s.quickStart);
    return STEPS;
  }, [path]);

  const currentStep = activeSteps[currentStepIndex];

  // All accumulated entries
  const allEntries = useMemo(
    () => Object.values(stepEntries).flat(),
    [stepEntries]
  );

  // Navigation
  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentStepIndex((prev) => Math.min(prev + 1, activeSteps.length - 1));
  }, [activeSteps.length]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Handle step data submission
  const handleStepData = useCallback(
    (stepId: string, entries: Omit<StatementEntry, "id">[]) => {
      setStepEntries((prev) => ({ ...prev, [stepId]: entries }));
      goNext();
    },
    [goNext]
  );

  // Handle path selection from welcome step
  const handleSelectPath = useCallback(
    (selectedPath: OnboardingPath) => {
      setPath(selectedPath);
      setDirection(1);
      setCurrentStepIndex(1);
    },
    []
  );

  // Auto-save handler for summary
  const handleSave = useCallback(
    async (data: {
      entries: Omit<StatementEntry, "id">[];
      totalAssets: number;
      totalLiabilities: number;
      netWorth: number;
    }) => {
      await deleteAllStatements();
      if (data.entries.length > 0) {
        await bulkAddStatements(data.entries);
      }
      const today = new Date().toISOString().split("T")[0];
      await saveSnapshot({
        date: today,
        totalAssets: data.totalAssets,
        totalLiabilities: data.totalLiabilities,
        netWorth: data.netWorth,
        entries: data.entries.map((e, i) => ({ ...e, id: `onboarding-${i}` })),
      });
    },
    [deleteAllStatements, bulkAddStatements, saveSnapshot]
  );

  // After saving, navigate to dashboard by reloading current route
  const handleGoToDashboard = useCallback(() => {
    window.location.reload();
  }, []);

  // Progress (excluding welcome and summary from the count display)
  const dataSteps = activeSteps.filter(
    (s) => s.id !== "welcome" && s.id !== "summary"
  );
  const currentDataStepIndex = dataSteps.findIndex(
    (s) => s.id === currentStep?.id
  );
  const showProgress =
    currentStep?.id !== "welcome" && currentStep?.id !== "summary";

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  // Render current step
  const renderStep = () => {
    if (!currentStep) return null;

    switch (currentStep.id) {
      case "welcome":
        return (
          <WelcomeStep onSelectPath={handleSelectPath} onDismiss={onDismiss} />
        );
      case "bank-savings":
        return (
          <BankSavingsStep
            initialEntries={stepEntries["bank-savings"] || []}
            onNext={(entries) => handleStepData("bank-savings", entries)}
            onBack={goBack}
          />
        );
      case "deposits":
        return (
          <DepositsStep
            initialEntries={stepEntries["deposits"] || []}
            onNext={(entries) => handleStepData("deposits", entries)}
            onBack={goBack}
          />
        );
      case "investments":
        return (
          <InvestmentsStep
            initialEntries={stepEntries["investments"] || []}
            onNext={(entries) => handleStepData("investments", entries)}
            onBack={goBack}
          />
        );
      case "property":
        return (
          <PropertyStep
            initialEntries={stepEntries["property"] || []}
            onNext={(entries) => handleStepData("property", entries)}
            onBack={goBack}
          />
        );
      case "loans":
        return (
          <LoansStep
            initialEntries={stepEntries["loans"] || []}
            onNext={(entries) => handleStepData("loans", entries)}
            onBack={goBack}
          />
        );
      case "credit-cards":
        return (
          <CreditCardsStep
            initialEntries={stepEntries["credit-cards"] || []}
            onNext={(entries) => handleStepData("credit-cards", entries)}
            onBack={goBack}
          />
        );
      case "summary":
        return (
          <SummaryStep
            entries={allEntries}
            onSave={handleSave}
            onGoToDashboard={handleGoToDashboard}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mb-2 flex items-center justify-between text-xs text-foreground/40">
              <span>
                Step {currentDataStepIndex + 1} of {dataSteps.length}
              </span>
              <span>
                {path === "quick" ? "Quick Start" : "Complete Picture"}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{
                  width: `${
                    ((currentDataStepIndex + 1) / dataSteps.length) * 100
                  }%`,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Step content with AnimatePresence */}
        <div className="surface-card relative overflow-hidden rounded-3xl border border-white/8 p-8 shadow-glow sm:p-10">
          {/* Welcome badge */}
          {currentStep?.id === "welcome" && (
            <div className="mb-7">
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                Welcome, {firstName}
              </span>
            </div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep?.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-foreground/30">
          Your data stays private · You can edit later from the Snapshot page
        </p>
      </div>
    </div>
  );
}
