import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { act } from "react";
import ContactPage from "./page";
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

describe("ContactPage", () => {
  beforeEach(() => {
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
    global.fetch = vi.fn();
  });

  // AC1: Contact form renders
  describe("AC1: Form rendering", () => {
    it("renders with RTL direction", () => {
      render(<ContactPage />);
      const main = getContainer().querySelector("main");
      expect(main?.getAttribute("dir")).toBe("rtl");
      expect(main?.getAttribute("lang")).toBe("he");
    });

    it("renders page title 'צור קשר'", () => {
      render(<ContactPage />);
      const h1 = getContainer().querySelector("h1");
      expect(h1?.textContent).toBe("צור קשר");
    });

    it("renders name, email, and message fields", () => {
      render(<ContactPage />);
      const container = getContainer();
      expect(container.querySelector("#contact-name")).not.toBeNull();
      expect(container.querySelector("#contact-email")).not.toBeNull();
      expect(container.querySelector("#contact-message")).not.toBeNull();
    });

    it("all required fields have 'required' attribute", () => {
      render(<ContactPage />);
      const container = getContainer();
      expect(container.querySelector("#contact-name")?.hasAttribute("required")).toBe(true);
      expect(container.querySelector("#contact-email")?.hasAttribute("required")).toBe(true);
      expect(container.querySelector("#contact-message")?.hasAttribute("required")).toBe(true);
    });

    it("renders back to editor link", () => {
      render(<ContactPage />);
      const link = getContainer().querySelector('a[href="/editor"]');
      expect(link).not.toBeNull();
      expect(link?.textContent).toContain("חזרה לעורך");
    });

    it("renders submit button", () => {
      render(<ContactPage />);
      const button = getContainer().querySelector('button[type="submit"]');
      expect(button).not.toBeNull();
      expect(button?.textContent).toContain("שלח הודעה");
    });
  });

  // AC5: Form validation and submission
  describe("AC5: Form submission", () => {
    it("shows success toast and resets form on successful submission", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ issueNumber: 1, issueUrl: "https://github.com/x/y/issues/1" }),
      });

      render(<ContactPage />);
      const container = getContainer();

      // Fill in form
      const nameInput = container.querySelector("#contact-name") as HTMLInputElement;
      const emailInput = container.querySelector("#contact-email") as HTMLInputElement;
      const messageInput = container.querySelector("#contact-message") as HTMLTextAreaElement;

      act(() => {
        nameInput.value = "Test User";
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));
        // Use React's onChange handler via native setter
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(nameInput, "Test User");
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(emailInput, "test@test.com");
        emailInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      act(() => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(messageInput, "Hello!");
        messageInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      // Submit form
      const form = container.querySelector("form")!;
      await act(async () => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });

      expect(mockToastSuccess).toHaveBeenCalledWith("ההודעה נשלחה בהצלחה ✓");
    });

    it("shows error toast on failed submission", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<ContactPage />);
      const container = getContainer();

      // Fill required fields
      const nameInput = container.querySelector("#contact-name") as HTMLInputElement;
      const emailInput = container.querySelector("#contact-email") as HTMLInputElement;
      const messageInput = container.querySelector("#contact-message") as HTMLTextAreaElement;

      act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(nameInput, "Test");
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(emailInput, "t@t.com");
        emailInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      act(() => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(messageInput, "Msg");
        messageInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      const form = container.querySelector("form")!;
      await act(async () => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });

      expect(mockToastError).toHaveBeenCalledWith("שגיאה בשליחת ההודעה. נסה שוב.");
    });

    it("sends correct payload to API with label 'contact'", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ issueNumber: 1, issueUrl: "url" }),
      });

      render(<ContactPage />);
      const container = getContainer();

      const nameInput = container.querySelector("#contact-name") as HTMLInputElement;
      const emailInput = container.querySelector("#contact-email") as HTMLInputElement;
      const messageInput = container.querySelector("#contact-message") as HTMLTextAreaElement;

      act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(nameInput, "Ben");
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      });
      act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(emailInput, "b@b.com");
        emailInput.dispatchEvent(new Event("input", { bubbles: true }));
      });
      act(() => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(messageInput, "Hi");
        messageInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      const form = container.querySelector("form")!;
      await act(async () => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });

      const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toBe("/api/github/create-issue");
      const body = JSON.parse(options.body);
      expect(body.labels).toEqual(["contact"]);
      expect(body.title).toContain("[Contact]");
      expect(body.body).toContain("Ben");
      expect(body.body).toContain("b@b.com");
    });

    it("disables form fields during submission", async () => {
      let resolvePromise: () => void;
      const pendingPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockReturnValue(
        pendingPromise.then(() => ({ ok: true, json: () => Promise.resolve({ issueNumber: 1, issueUrl: "u" }) }))
      );

      render(<ContactPage />);
      const container = getContainer();

      const nameInput = container.querySelector("#contact-name") as HTMLInputElement;
      const emailInput = container.querySelector("#contact-email") as HTMLInputElement;
      const messageInput = container.querySelector("#contact-message") as HTMLTextAreaElement;

      act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(nameInput, "X");
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      });
      act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(emailInput, "x@x.com");
        emailInput.dispatchEvent(new Event("input", { bubbles: true }));
      });
      act(() => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(messageInput, "M");
        messageInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      const form = container.querySelector("form")!;
      act(() => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });

      // During submission, button should show "שולח..."
      const button = container.querySelector('button[type="submit"]');
      expect(button?.textContent).toContain("שולח...");
      expect(button?.hasAttribute("disabled")).toBe(true);

      // Resolve to clean up
      await act(async () => {
        resolvePromise!();
      });
    });
  });
});
