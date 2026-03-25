import { describe, it, expect, vi, beforeEach } from "vitest";
import { LandingRedirectGuard, SEEN_KEY } from "./LandingRedirectGuard";
import { setupComponentTest } from "./test-utils";

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

const { render, getContainer } = setupComponentTest();

describe("LandingRedirectGuard", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockSearchParams = new URLSearchParams();
    localStorage.clear();
  });

  // AC1: First-time visitor sees landing page
  describe("AC1: First-time visitor", () => {
    it("renders children when no localStorage flag exists", () => {
      render(
        <LandingRedirectGuard>
          <div data-testid="landing">Landing Content</div>
        </LandingRedirectGuard>
      );
      expect(getContainer().querySelector("[data-testid='landing']")).not.toBeNull();
    });

    it("sets the seen-landing flag on mount", () => {
      render(
        <LandingRedirectGuard>
          <div>Content</div>
        </LandingRedirectGuard>
      );
      expect(localStorage.getItem(SEEN_KEY)).toBe("true");
    });
  });

  // AC2: Returning visitor auto-redirects
  describe("AC2: Returning visitor redirect", () => {
    it("calls router.replace('/editor') when flag exists", () => {
      localStorage.setItem(SEEN_KEY, "true");
      render(
        <LandingRedirectGuard>
          <div data-testid="landing">Landing Content</div>
        </LandingRedirectGuard>
      );
      expect(mockReplace).toHaveBeenCalledWith("/editor");
    });

    it("does NOT render children when redirecting", () => {
      localStorage.setItem(SEEN_KEY, "true");
      render(
        <LandingRedirectGuard>
          <div data-testid="landing">Landing Content</div>
        </LandingRedirectGuard>
      );
      expect(getContainer().querySelector("[data-testid='landing']")).toBeNull();
    });
  });

  // AC3: Logo click bypasses redirect (?home=true)
  describe("AC3: ?home=true bypass", () => {
    it("renders children when flag exists and ?home=true is present", () => {
      localStorage.setItem(SEEN_KEY, "true");
      mockSearchParams = new URLSearchParams("home=true");
      render(
        <LandingRedirectGuard>
          <div data-testid="landing">Landing Content</div>
        </LandingRedirectGuard>
      );
      expect(getContainer().querySelector("[data-testid='landing']")).not.toBeNull();
      expect(mockReplace).not.toHaveBeenCalledWith("/editor");
    });

    it("cleans up ?home=true param via router.replace, preserving other params", () => {
      localStorage.setItem(SEEN_KEY, "true");
      mockSearchParams = new URLSearchParams("home=true&utm_source=newsletter");
      render(
        <LandingRedirectGuard>
          <div>Content</div>
        </LandingRedirectGuard>
      );
      expect(mockReplace).toHaveBeenCalledWith("/?utm_source=newsletter", { scroll: false });
    });
  });

  // AC4: No flag + ?home=true
  describe("AC4: First visit with ?home=true", () => {
    it("renders children and sets flag when no flag and ?home=true", () => {
      mockSearchParams = new URLSearchParams("home=true");
      render(
        <LandingRedirectGuard>
          <div data-testid="landing">Landing Content</div>
        </LandingRedirectGuard>
      );
      expect(getContainer().querySelector("[data-testid='landing']")).not.toBeNull();
      expect(localStorage.getItem(SEEN_KEY)).toBe("true");
    });
  });

  // Edge case: localStorage throws
  describe("Edge case: localStorage unavailable", () => {
    it("renders children gracefully when localStorage throws", () => {
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = () => {
        throw new Error("SecurityError: localStorage is not available");
      };

      render(
        <LandingRedirectGuard>
          <div data-testid="landing">Landing Content</div>
        </LandingRedirectGuard>
      );
      expect(getContainer().querySelector("[data-testid='landing']")).not.toBeNull();
      expect(mockReplace).not.toHaveBeenCalledWith("/editor");

      Storage.prototype.getItem = originalGetItem;
    });
  });

  // Edge case: localStorage.setItem throws (storage full) but getItem works
  describe("Edge case: localStorage.setItem fails (storage full)", () => {
    it("renders children when setItem throws but getItem succeeds", () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error("QuotaExceededError: storage full");
      };

      render(
        <LandingRedirectGuard>
          <div data-testid="landing">Landing Content</div>
        </LandingRedirectGuard>
      );
      expect(getContainer().querySelector("[data-testid='landing']")).not.toBeNull();
      expect(mockReplace).not.toHaveBeenCalledWith("/editor");

      Storage.prototype.setItem = originalSetItem;
    });
  });
});
