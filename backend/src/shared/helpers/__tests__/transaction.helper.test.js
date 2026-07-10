import { beforeEach, describe, expect, it, vi } from "vitest";

describe("withTransaction", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("runs callbacks without a session on standalone MongoDB deployments", async () => {
    const admin = {
      command: vi.fn().mockResolvedValue({ ok: 1 }),
    };
    const startSession = vi.fn();

    vi.doMock("mongoose", () => ({
      default: {
        connection: {
          db: {
            admin: () => admin,
          },
        },
        startSession,
      },
    }));

    const { withTransaction } = await import("../transaction.helper.js");
    const callback = vi.fn(async (session) => session ?? "no-session");

    const result = await withTransaction(callback);

    expect(admin.command).toHaveBeenCalledWith({ hello: 1 });
    expect(startSession).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(undefined);
    expect(result).toBe("no-session");
  });

  it("opens a transaction when the MongoDB topology supports it", async () => {
    const mockSession = {
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
      inTransaction: vi.fn(() => false),
    };
    const admin = {
      command: vi.fn().mockResolvedValue({ ok: 1, setName: "rs0" }),
    };
    const startSession = vi.fn(async () => mockSession);

    vi.doMock("mongoose", () => ({
      default: {
        connection: {
          db: {
            admin: () => admin,
          },
        },
        startSession,
      },
    }));

    const { withTransaction } = await import("../transaction.helper.js");
    const callback = vi.fn(async (session) => ({ session }));

    const result = await withTransaction(callback);

    expect(startSession).toHaveBeenCalledTimes(1);
    expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(mockSession);
    expect(result).toEqual({ session: mockSession });
  });
});
