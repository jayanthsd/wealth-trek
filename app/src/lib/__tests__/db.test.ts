// @vitest-environment node
const mockAuth = vi.fn();
const mockCreateClient = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: mockCreateClient,
}));

describe("db", () => {
  it("returns authenticated Supabase client when user is signed in", async () => {
    const fakeToken = "test-jwt-token";
    const fakeSupabase = { from: vi.fn() };
    mockAuth.mockResolvedValue({ userId: "user_123", getToken: vi.fn().mockResolvedValue(fakeToken) });
    mockCreateClient.mockReturnValue(fakeSupabase);

    const { getAuthenticatedClient } = await import("@/lib/db");
    const { userId, supabase } = await getAuthenticatedClient();

    expect(userId).toBe("user_123");
    expect(supabase).toBe(fakeSupabase);
    expect(mockCreateClient).toHaveBeenCalledWith(fakeToken);
  });

  it("returns null supabase when user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null, getToken: vi.fn() });

    const { getAuthenticatedClient } = await import("@/lib/db");
    const { userId, supabase } = await getAuthenticatedClient();

    expect(userId).toBeNull();
    expect(supabase).toBeNull();
  });

  it("returns null supabase when token is unavailable", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123", getToken: vi.fn().mockResolvedValue(null) });

    const { getAuthenticatedClient } = await import("@/lib/db");
    const { userId, supabase } = await getAuthenticatedClient();

    expect(userId).toBe("user_123");
    expect(supabase).toBeNull();
  });
});
