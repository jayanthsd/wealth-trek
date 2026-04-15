/**
 * Utility to migrate localStorage data to database
 * This should be called during app initialization to migrate existing data
 */

interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  targetAmount?: number;
  targetDate?: string;
  createdAt: string;
  status: "active" | "completed" | "paused";
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestedGoal?: Omit<FinancialGoal, "id" | "createdAt" | "status">;
}

interface UserProfile {
  fullName: string;
  address: string;
  certificateDate: string;
  asOnDate: string;
}

interface MigrationResult {
  success: boolean;
  migrated: {
    goals: number;
    chatMessages: number;
    profile: boolean;
  };
  errors: string[];
}

/**
 * Migrate goals from localStorage to database
 */
async function migrateGoals(): Promise<{ count: number; error?: string }> {
  try {
    const stored = localStorage.getItem("financial-goals");
    if (!stored) return { count: 0 };

    const goals: FinancialGoal[] = JSON.parse(stored);
    if (goals.length === 0) return { count: 0 };

    // Check if database already has goals
    const existingRes = await fetch("/api/goals");
    if (!existingRes.ok) throw new Error("Failed to check existing goals");
    const existingData = await existingRes.json();
    if (existingData.goals && existingData.goals.length > 0) {
      // Already migrated, skip
      return { count: 0 };
    }

    // Migrate each goal
    let migrated = 0;
    for (const goal of goals) {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goal.title,
          description: goal.description,
          targetAmount: goal.targetAmount,
          targetDate: goal.targetDate,
          status: goal.status,
        }),
      });
      if (!res.ok) throw new Error(`Failed to migrate goal ${goal.id}`);
      migrated++;
    }

    // Clear localStorage on success
    localStorage.removeItem("financial-goals");
    return { count: migrated };
  } catch (error) {
    return { count: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Migrate chat messages from localStorage to database
 */
async function migrateChatMessages(): Promise<{ count: number; error?: string }> {
  try {
    const stored = localStorage.getItem("financial-chat-history");
    if (!stored) return { count: 0 };

    const messages: ChatMessage[] = JSON.parse(stored);
    if (messages.length === 0) return { count: 0 };

    // Check if database already has messages
    const existingRes = await fetch("/api/chat/messages");
    if (!existingRes.ok) throw new Error("Failed to check existing messages");
    const existingData = await existingRes.json();
    if (existingData.messages && existingData.messages.length > 0) {
      // Already migrated, skip
      return { count: 0 };
    }

    // Migrate each message
    let migrated = 0;
    for (const message of messages) {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: message.role,
          content: message.content,
          suggestedGoal: message.suggestedGoal,
        }),
      });
      if (!res.ok) throw new Error(`Failed to migrate message ${message.id}`);
      migrated++;
    }

    // Clear localStorage on success
    localStorage.removeItem("financial-chat-history");
    return { count: migrated };
  } catch (error) {
    return { count: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Migrate user profile from localStorage to database
 */
async function migrateProfile(): Promise<{ migrated: boolean; error?: string }> {
  try {
    const stored = localStorage.getItem("nwc_profile");
    if (!stored) return { migrated: false };

    const profile: UserProfile = JSON.parse(stored);
    if (!profile.fullName && !profile.address) return { migrated: false };

    // Check if database already has profile
    const existingRes = await fetch("/api/profile");
    if (!existingRes.ok) throw new Error("Failed to check existing profile");
    const existingData = await existingRes.json();
    if (existingData.profile && existingData.profile.fullName) {
      // Already migrated, skip
      return { migrated: false };
    }

    // Migrate profile
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error("Failed to migrate profile");

    // Clear localStorage on success
    localStorage.removeItem("nwc_profile");
    return { migrated: true };
  } catch (error) {
    return { migrated: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Run full migration from localStorage to database
 * Call this during app initialization
 */
export async function migrateLocalStorageToDb(): Promise<MigrationResult> {
  const errors: string[] = [];
  const migrated = {
    goals: 0,
    chatMessages: 0,
    profile: false,
  };

  // Migrate goals
  const goalsResult = await migrateGoals();
  if (goalsResult.error) {
    errors.push(`Goals: ${goalsResult.error}`);
  } else {
    migrated.goals = goalsResult.count;
  }

  // Migrate chat messages
  const chatResult = await migrateChatMessages();
  if (chatResult.error) {
    errors.push(`Chat: ${chatResult.error}`);
  } else {
    migrated.chatMessages = chatResult.count;
  }

  // Migrate profile
  const profileResult = await migrateProfile();
  if (profileResult.error) {
    errors.push(`Profile: ${profileResult.error}`);
  } else {
    migrated.profile = profileResult.migrated;
  }

  return {
    success: errors.length === 0,
    migrated,
    errors,
  };
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  return !!(
    localStorage.getItem("financial-goals") ||
    localStorage.getItem("financial-chat-history") ||
    localStorage.getItem("nwc_profile")
  );
}
