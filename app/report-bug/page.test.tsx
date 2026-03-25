import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { act } from "react";
import ReportBugPage from "./page";
import { setupComponentTest } from "../settings/test-utils";

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

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock sonner
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  }),
}));

const { render, getContainer } = setupComponentTest();

describe("ReportBugPage", () => {
  beforeEach(() => {
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
    global.fetch = vi.fn();
    localStorage.clear();
  });

  // AC2: Bug report form renders
  describe("AC2: Form rendering", () => {
    it("renders with RTL direction", () => {
      render(<ReportBugPage />);
      const main = getContainer().querySelector("main");
      expect(main?.getAttribute("dir")).toBe("rtl");
      expect(main?.getAttribute("lang")).toBe("he");
    });

    it("renders page title 'דווח על בעיה'", () => {
      render(<ReportBugPage />);
      const h1 = getContainer().querySelector("h1");
      expect(h1?.textContent).toBe("דווח על בעיה");
    });

    it("renders description (required), steps, expected, and screenshot fields", () => {
      render(<ReportBugPage />);
      const container = getContainer();
      expect(container.querySelector("#bug-description")).not.toBeNull();
      expect(container.querySelector("#bug-steps")).not.toBeNull();
      expect(container.querySelector("#bug-expected")).not.toBeNull();
      expect(container.querySelector("#bug-screenshot")).not.toBeNull();
    });

    it("only description field has 'required' attribute", () => {
      render(<ReportBugPage />);
      const container = getContainer();
      expect(container.querySelector("#bug-description")?.hasAttribute("required")).toBe(true);
      expect(container.querySelector("#bug-steps")?.hasAttribute("required")).toBe(false);
      expect(container.querySelector("#bug-expected")?.hasAttribute("required")).toBe(false);
      expect(container.querySelector("#bug-screenshot")?.hasAttribute("required")).toBe(false);
    });

    it("renders back to editor link", () => {
      render(<ReportBugPage />);
      const link = getContainer().querySelector('a[href="/editor"]');
      expect(link).not.toBeNull();
      expect(link?.textContent).toContain("חזרה לעורך");
    });

    it("renders submit button", () => {
      render(<ReportBugPage />);
      const button = getContainer().querySelector('button[type="submit"]');
      expect(button).not.toBeNull();
      expect(button?.textContent).toContain("שלח דיווח");
    });
  });

  // AC2 + AC5: Submission and metadata
  describe("AC2+AC5: Bug report submission", () => {
    it("shows success toast on successful submission", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ issueNumber: 5, issueUrl: "https://github.com/x/y/issues/5" }),
      });

      render(<ReportBugPage />);
      const container = getContainer();

      const descInput = container.querySelector("#bug-description") as HTMLTextAreaElement;

      act(() => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(descInput, "App crashes");
        descInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      const form = container.querySelector("form")!;
      await act(async () => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });

      expect(mockToastSuccess).toHaveBeenCalledWith("הדיווח נשלח בהצלחה ✓");
    });

    it("shows error toast on failed submission", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<ReportBugPage />);
      const container = getContainer();

      const descInput = container.querySelector("#bug-description") as HTMLTextAreaElement;

      act(() => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(descInput, "Bug");
        descInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      const form = container.querySelector("form")!;
      await act(async () => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });

      expect(mockToastError).toHaveBeenCalledWith("שגיאה בשליחת הדיווח. נסה שוב.");
    });

    it("sends payload with label 'bug' and includes metadata", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ issueNumber: 1, issueUrl: "url" }),
      });

      render(<ReportBugPage />);
      const container = getContainer();

      const descInput = container.querySelector("#bug-description") as HTMLTextAreaElement;

      act(() => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(descInput, "Crash on save");
        descInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      const form = container.querySelector("form")!;
      await act(async () => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });

      const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toBe("/api/github/create-issue");
      const body = JSON.parse(options.body);
      expect(body.labels).toEqual(["bug"]);
      expect(body.title).toContain("[Bug]");
      expect(body.body).toContain("Crash on save");
      // Metadata should be included
      expect(body.body).toContain("Environment Details");
      expect(body.body).toContain("Browser");
      expect(body.body).toContain("Timestamp");
    });

    it("includes optional fields when provided", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ issueNumber: 1, issueUrl: "url" }),
      });

      render(<ReportBugPage />);
      const container = getContainer();

      const descInput = container.querySelector("#bug-description") as HTMLTextAreaElement;
      const stepsInput = container.querySelector("#bug-steps") as HTMLTextAreaElement;
      const expectedInput = container.querySelector("#bug-expected") as HTMLInputElement;

      act(() => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(descInput, "Bug desc");
        descInput.dispatchEvent(new Event("input", { bubbles: true }));
      });
      act(() => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(stepsInput, "Step 1\nStep 2");
        stepsInput.dispatchEvent(new Event("input", { bubbles: true }));
      });
      act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(expectedInput, "Should work");
        expectedInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      const form = container.querySelector("form")!;
      await act(async () => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });

      const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.body).toContain("Step 1");
      expect(body.body).toContain("Should work");
    });

    it("uses 'לא צוין' for empty optional fields", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ issueNumber: 1, issueUrl: "url" }),
      });

      render(<ReportBugPage />);
      const container = getContainer();

      const descInput = container.querySelector("#bug-description") as HTMLTextAreaElement;

      act(() => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(descInput, "Bug only");
        descInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      const form = container.querySelector("form")!;
      await act(async () => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });

      const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      // Optional fields should show "לא צוין"
      const occurrences = (body.body.match(/לא צוין/g) || []).length;
      expect(occurrences).toBeGreaterThanOrEqual(2); // steps + expected at minimum
    });

    it("disables form fields during submission", async () => {
      let resolvePromise: () => void;
      const pendingPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockReturnValue(
        pendingPromise.then(() => ({ ok: true, json: () => Promise.resolve({ issueNumber: 1, issueUrl: "u" }) }))
      );

      render(<ReportBugPage />);
      const container = getContainer();

      const descInput = container.querySelector("#bug-description") as HTMLTextAreaElement;

      act(() => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(descInput, "Bug");
        descInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      const form = container.querySelector("form")!;
      act(() => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });

      const button = container.querySelector('button[type="submit"]');
      expect(button?.textContent).toContain("שולח...");
      expect(button?.hasAttribute("disabled")).toBe(true);

      await act(async () => {
        resolvePromise!();
      });
    });
  });

  // AC2: Metadata collection
  describe("AC2: Metadata collection", () => {
    it("collects browser metadata and includes in issue body", async () => {
      localStorage.setItem("marko-v2-active-theme", "ocean-breeze");
      localStorage.setItem("marko-v2-editor-content", "Hello world test content");

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ issueNumber: 1, issueUrl: "url" }),
      });

      render(<ReportBugPage />);
      const container = getContainer();

      const descInput = container.querySelector("#bug-description") as HTMLTextAreaElement;

      act(() => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(descInput, "Test bug");
        descInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      const form = container.querySelector("form")!;
      await act(async () => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });

      const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(body.body).toContain("ocean-breeze");
      expect(body.body).toContain("24 chars"); // "Hello world test content".length = 24
    });
  });
});
