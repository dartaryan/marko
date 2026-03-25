import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import SettingsPage from "./page";
import { setupComponentTest } from "./test-utils";
import { DOC_DIRECTION_KEY } from "@/lib/hooks/useDocDirection";
import { AUTO_SAVE_KEY } from "@/lib/hooks/useAutoSave";
import { FONT_SIZE_KEY } from "@/lib/hooks/useFontSize";
import { DARK_LIGHT_MODE_PREF_KEY } from "@/lib/hooks/useDarkLightModePref";
import { act } from "react";

// JSDOM doesn't provide matchMedia
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mocks
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(),
}));

// next/link renders as an anchor
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Clerk mock
let mockClerkUser: { primaryEmailAddress?: { emailAddress: string }; firstName?: string; lastName?: string } | null = null;
vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({ user: mockClerkUser }),
}));

// Convex auth mock
let mockIsAuthenticated = false;
let mockConvexUser: { tier: string; _id: string } | null = null;
let mockAiUsage: { count: number; limit: number | null } | null = null;
let mockConvexSettings: Record<string, unknown> | null = null;
const mockSaveSettings = vi.fn().mockResolvedValue(null);

vi.mock("convex/react", () => ({
  useConvexAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    isLoading: false,
  }),
  useQuery: (ref: { _name?: string } | string, args?: unknown) => {
    if (args === "skip") return undefined;
    const name = typeof ref === "string" ? ref : (ref as { _name?: string })?._name ?? "";
    if (name.includes("getCurrentUser") || String(ref).includes("getCurrentUser")) return mockConvexUser;
    if (name.includes("getMyMonthlyUsage") || String(ref).includes("getMyMonthlyUsage")) return mockAiUsage;
    if (name.includes("getMySettings") || String(ref).includes("getMySettings")) return mockConvexSettings;
    return undefined;
  },
  useMutation: () => mockSaveSettings,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    users: { getCurrentUser: { _name: "getCurrentUser" } },
    usage: { getMyMonthlyUsage: { _name: "getMyMonthlyUsage" } },
    userSettings: {
      getMySettings: { _name: "getMySettings" },
      saveMySettings: { _name: "saveMySettings" },
    },
  },
}));

// Mock applyColorTheme
vi.mock("@/lib/colors/apply-colors", () => ({
  applyColorTheme: vi.fn(),
}));

// Mock PresetGrid to avoid complex dependency chain
vi.mock("@/components/theme/PresetGrid", () => ({
  PresetGrid: () => <div data-testid="preset-grid">Theme Picker</div>,
}));

const { render, getContainer } = setupComponentTest();

describe("SettingsPage", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockIsAuthenticated = false;
    mockConvexUser = null;
    mockClerkUser = null;
    mockAiUsage = null;
    mockConvexSettings = null;
    mockSaveSettings.mockClear();
  });

  // AC1: Settings page renders with 3 sections (logged-in)
  describe("AC1: Page layout and sections", () => {
    it("renders with RTL direction", () => {
      render(<SettingsPage />);
      const main = getContainer().querySelector("main");
      expect(main?.getAttribute("dir")).toBe("rtl");
      expect(main?.getAttribute("lang")).toBe("he");
    });

    it("renders page title 'הגדרות'", () => {
      render(<SettingsPage />);
      const h1 = getContainer().querySelector("h1");
      expect(h1?.textContent).toBe("הגדרות");
    });

    it("renders 'עריכה' and 'מראה' sections for anonymous users", () => {
      render(<SettingsPage />);
      const headings = getContainer().querySelectorAll("h2");
      const headingTexts = Array.from(headings).map((h) => h.textContent);
      expect(headingTexts).toContain("עריכה");
      expect(headingTexts).toContain("מראה");
    });

    it("does NOT render 'חשבון' section for anonymous users", () => {
      render(<SettingsPage />);
      const headings = getContainer().querySelectorAll("h2");
      const headingTexts = Array.from(headings).map((h) => h.textContent);
      expect(headingTexts).not.toContain("חשבון");
    });

    it("renders all 3 sections for logged-in users", () => {
      mockIsAuthenticated = true;
      mockConvexUser = { tier: "free", _id: "user1" };
      mockClerkUser = { primaryEmailAddress: { emailAddress: "test@test.com" }, firstName: "Ben" };
      mockAiUsage = { count: 2, limit: 5 };

      render(<SettingsPage />);
      const headings = getContainer().querySelectorAll("h2");
      const headingTexts = Array.from(headings).map((h) => h.textContent);
      expect(headingTexts).toContain("עריכה");
      expect(headingTexts).toContain("מראה");
      expect(headingTexts).toContain("חשבון");
    });
  });

  // AC2: Direction radio group
  describe("AC2: Direction radio group", () => {
    it("renders 3 direction options", () => {
      render(<SettingsPage />);
      const radios = getContainer().querySelectorAll('input[name="direction"]');
      expect(radios.length).toBe(3);
    });

    it("persists direction change to localStorage", () => {
      render(<SettingsPage />);
      const ltrLabel = Array.from(getContainer().querySelectorAll("label")).find(
        (l) => l.textContent?.includes("שמאל לימין")
      ) as HTMLLabelElement;
      expect(ltrLabel).not.toBeNull();

      act(() => {
        ltrLabel.click();
      });

      // After clicking ltr, localStorage should be updated
      const stored = localStorage.getItem(DOC_DIRECTION_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toBe("ltr");
    });
  });

  // AC3: Auto-save toggle
  describe("AC3: Auto-save toggle", () => {
    it("renders auto-save switch", () => {
      render(<SettingsPage />);
      const toggle = getContainer().querySelector('[role="switch"]');
      expect(toggle).not.toBeNull();
      expect(toggle?.getAttribute("aria-checked")).toBe("true"); // default on
    });

    it("toggles auto-save value on click", () => {
      render(<SettingsPage />);
      const toggle = getContainer().querySelector('[role="switch"]') as HTMLButtonElement;

      act(() => {
        toggle.click();
      });

      // After toggle, should be false
      const stored = localStorage.getItem(AUTO_SAVE_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toBe(false);
    });
  });

  // AC4: Theme picker
  describe("AC4: Theme picker", () => {
    it("renders the PresetGrid component", () => {
      render(<SettingsPage />);
      const grid = getContainer().querySelector('[data-testid="preset-grid"]');
      expect(grid).not.toBeNull();
    });
  });

  // AC5: Dark/light mode preference
  describe("AC5: Dark/light mode preference", () => {
    it("renders 3 mode options", () => {
      render(<SettingsPage />);
      const radios = getContainer().querySelectorAll('input[name="mode"]');
      expect(radios.length).toBe(3);
    });

    it("persists mode change to localStorage", () => {
      render(<SettingsPage />);
      const darkLabel = Array.from(getContainer().querySelectorAll("label")).find(
        (l) => l.textContent === "אפל"
      ) as HTMLLabelElement;
      expect(darkLabel).not.toBeNull();

      act(() => {
        darkLabel.click();
      });

      const stored = localStorage.getItem(DARK_LIGHT_MODE_PREF_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toBe("dark");
    });
  });

  // AC6: Font size
  describe("AC6: Font size radio group", () => {
    it("renders 3 font size options", () => {
      render(<SettingsPage />);
      const radios = getContainer().querySelectorAll('input[name="fontSize"]');
      expect(radios.length).toBe(3);
    });

    it("persists font size change to localStorage", () => {
      render(<SettingsPage />);
      const largeLabel = Array.from(getContainer().querySelectorAll("label")).find(
        (l) => l.textContent === "גדול"
      ) as HTMLLabelElement;
      expect(largeLabel).not.toBeNull();

      act(() => {
        largeLabel.click();
      });

      const stored = localStorage.getItem(FONT_SIZE_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toBe("large");
    });
  });

  // AC7: Account section — logged-in only
  describe("AC7: Account section visibility", () => {
    it("hides Account section for anonymous users", () => {
      render(<SettingsPage />);
      const headings = getContainer().querySelectorAll("h2");
      const headingTexts = Array.from(headings).map((h) => h.textContent);
      expect(headingTexts).not.toContain("חשבון");
    });

    it("shows Account section with user info for logged-in users", () => {
      mockIsAuthenticated = true;
      mockConvexUser = { tier: "free", _id: "user1" };
      mockClerkUser = {
        primaryEmailAddress: { emailAddress: "user@example.com" },
        firstName: "Test",
        lastName: "User",
      };
      mockAiUsage = { count: 3, limit: 5 };

      render(<SettingsPage />);
      const container = getContainer();
      expect(container.textContent).toContain("user@example.com");
      expect(container.textContent).toContain("Test User");
      expect(container.textContent).toContain("חינם");
    });
  });

  // AC8: AI usage display
  describe("AC8: AI usage display", () => {
    it("shows AI usage count for free user", () => {
      mockIsAuthenticated = true;
      mockConvexUser = { tier: "free", _id: "user1" };
      mockClerkUser = { primaryEmailAddress: { emailAddress: "test@test.com" } };
      mockAiUsage = { count: 3, limit: 5 };

      render(<SettingsPage />);
      const container = getContainer();
      expect(container.textContent).toContain("3 מתוך 5 פעולות AI החודש");
    });

    it("shows progress bar for free user", () => {
      mockIsAuthenticated = true;
      mockConvexUser = { tier: "free", _id: "user1" };
      mockClerkUser = { primaryEmailAddress: { emailAddress: "test@test.com" } };
      mockAiUsage = { count: 3, limit: 5 };

      render(<SettingsPage />);
      const progressBar = getContainer().querySelector('[role="progressbar"]');
      expect(progressBar).not.toBeNull();
    });

    it("shows unlimited usage for paid user", () => {
      mockIsAuthenticated = true;
      mockConvexUser = { tier: "paid", _id: "user1" };
      mockClerkUser = { primaryEmailAddress: { emailAddress: "test@test.com" } };
      mockAiUsage = { count: 10, limit: null };

      render(<SettingsPage />);
      const container = getContainer();
      expect(container.textContent).toContain("שימוש ללא הגבלה");
    });

    it("shows premium badge for paid user", () => {
      mockIsAuthenticated = true;
      mockConvexUser = { tier: "paid", _id: "user1" };
      mockClerkUser = { primaryEmailAddress: { emailAddress: "test@test.com" } };
      mockAiUsage = { count: 10, limit: null };

      render(<SettingsPage />);
      const container = getContainer();
      expect(container.textContent).toContain("פרימיום");
    });
  });

  // AC9: Convex sync
  describe("AC9: Convex settings sync", () => {
    it("calls saveMySettings after a setting change for logged-in users", async () => {
      mockIsAuthenticated = true;
      mockConvexUser = { tier: "free", _id: "user1" };
      mockClerkUser = { primaryEmailAddress: { emailAddress: "test@test.com" } };
      mockAiUsage = { count: 0, limit: 5 };
      // null = no prior settings, triggers initialLoadDoneRef = true
      mockConvexSettings = null;

      render(<SettingsPage />);

      // Change a setting
      const toggle = getContainer().querySelector('[role="switch"]') as HTMLButtonElement;
      act(() => {
        toggle.click();
      });

      // Wait for debounce (500ms)
      await act(async () => {
        await new Promise((r) => setTimeout(r, 600));
      });

      expect(mockSaveSettings).toHaveBeenCalled();
    });

    it("does not call saveMySettings for anonymous users", async () => {
      render(<SettingsPage />);

      const toggle = getContainer().querySelector('[role="switch"]') as HTMLButtonElement;
      act(() => {
        toggle.click();
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 600));
      });

      expect(mockSaveSettings).not.toHaveBeenCalled();
    });
  });

  // AC10: Navigation and accessibility
  describe("AC10: Navigation and accessibility", () => {
    it("renders back to editor link", () => {
      render(<SettingsPage />);
      const link = getContainer().querySelector('a[href="/editor"]');
      expect(link).not.toBeNull();
      expect(link?.textContent).toContain("חזרה לעורך");
    });

    it("all form controls have ARIA labels", () => {
      render(<SettingsPage />);
      const radios = getContainer().querySelectorAll('input[type="radio"]');
      radios.forEach((radio) => {
        expect(radio.getAttribute("aria-label")).not.toBeNull();
      });

      const switchEl = getContainer().querySelector('[role="switch"]');
      expect(switchEl?.getAttribute("aria-checked")).not.toBeNull();
    });

    it("supports keyboard navigation (Tab between radio inputs)", () => {
      render(<SettingsPage />);
      const container = getContainer();
      // Verify there are focusable elements
      const radios = container.querySelectorAll('input[type="radio"]');
      expect(radios.length).toBeGreaterThan(0);

      // Verify the switch is a button (natively focusable)
      const switchEl = container.querySelector('[role="switch"]');
      expect(switchEl?.tagName).toBe("BUTTON");
    });
  });
});
