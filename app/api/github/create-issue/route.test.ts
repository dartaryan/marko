import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";

const originalEnv = { ...process.env };

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/github/create-issue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/github/create-issue", () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.GITHUB_OWNER = "test-owner";
    process.env.GITHUB_REPO = "test-repo";
    global.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  // AC3: Successful issue creation
  describe("AC3: Successful issue creation", () => {
    it("returns 201 with issue number and URL on success", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ number: 42, html_url: "https://github.com/test-owner/test-repo/issues/42" }),
      });

      const res = await POST(makeRequest({
        title: "[Contact] Test",
        body: "Test body",
        labels: ["contact"],
      }));

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.issueNumber).toBe(42);
      expect(data.issueUrl).toBe("https://github.com/test-owner/test-repo/issues/42");
    });

    it("sends correct headers to GitHub API", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ number: 1, html_url: "https://github.com/x/y/issues/1" }),
      });

      await POST(makeRequest({
        title: "Test",
        body: "Body",
        labels: ["bug"],
      }));

      const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toBe("https://api.github.com/repos/test-owner/test-repo/issues");
      expect(options.headers.Authorization).toBe("Bearer test-token");
      expect(options.headers.Accept).toBe("application/vnd.github+json");
      expect(options.headers["X-GitHub-Api-Version"]).toBe("2022-11-28");
    });
  });

  // AC3: Missing required fields
  describe("AC3: Validation errors", () => {
    it("returns 400 when title is missing", async () => {
      const res = await POST(makeRequest({
        body: "Test body",
        labels: ["contact"],
      }));
      expect(res.status).toBe(400);
    });

    it("returns 400 when body is missing", async () => {
      const res = await POST(makeRequest({
        title: "Test",
        labels: ["contact"],
      }));
      expect(res.status).toBe(400);
    });

    it("returns 400 when labels is not an array", async () => {
      const res = await POST(makeRequest({
        title: "Test",
        body: "Body",
        labels: "contact",
      }));
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid JSON body", async () => {
      const req = new Request("http://localhost/api/github/create-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 when title is whitespace-only", async () => {
      const res = await POST(makeRequest({
        title: "   ",
        body: "Valid body",
        labels: ["contact"],
      }));
      expect(res.status).toBe(400);
    });

    it("returns 400 when body is whitespace-only", async () => {
      const res = await POST(makeRequest({
        title: "Valid title",
        body: "   ",
        labels: ["contact"],
      }));
      expect(res.status).toBe(400);
    });
  });

  // Sanitization
  describe("Input sanitization", () => {
    it("filters out invalid labels", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ number: 1, html_url: "https://github.com/x/y/issues/1" }),
      });

      await POST(makeRequest({
        title: "Test",
        body: "Body",
        labels: ["contact", "malicious-label", "bug"],
      }));

      const sentBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(sentBody.labels).toEqual(["contact", "bug"]);
    });

    it("neutralizes @-mentions in title and body", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ number: 1, html_url: "https://github.com/x/y/issues/1" }),
      });

      await POST(makeRequest({
        title: "[Contact] @admin",
        body: "Hey @user please help",
        labels: ["contact"],
      }));

      const sentBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(sentBody.title).not.toContain("@a");
      expect(sentBody.body).not.toContain("@u");
    });
  });

  // AC3: GitHub API errors
  describe("AC3: GitHub API error handling", () => {
    it("returns 429 when GitHub rate limits (403 with x-ratelimit-remaining: 0)", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 403,
        headers: new Headers({ "x-ratelimit-remaining": "0" }),
      });

      const res = await POST(makeRequest({
        title: "Test",
        body: "Body",
        labels: ["contact"],
      }));
      expect(res.status).toBe(429);
    });

    it("returns 502 when GitHub returns 403 for non-rate-limit reasons", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 403,
        headers: new Headers({ "x-ratelimit-remaining": "100" }),
      });

      const res = await POST(makeRequest({
        title: "Test",
        body: "Body",
        labels: ["contact"],
      }));
      expect(res.status).toBe(502);
    });

    it("returns 502 when GitHub auth fails (401)", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 401,
      });

      const res = await POST(makeRequest({
        title: "Test",
        body: "Body",
        labels: ["contact"],
      }));
      expect(res.status).toBe(502);
    });

    it("returns 400 when GitHub validation fails (422)", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 422,
      });

      const res = await POST(makeRequest({
        title: "Test",
        body: "Body",
        labels: ["contact"],
      }));
      expect(res.status).toBe(400);
    });

    it("returns 502 when fetch throws a network error", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));

      const res = await POST(makeRequest({
        title: "Test",
        body: "Body",
        labels: ["contact"],
      }));
      expect(res.status).toBe(502);
    });
  });

  // AC3: Missing env vars
  describe("AC3: Missing environment variables", () => {
    it("returns 500 when GITHUB_TOKEN is missing", async () => {
      delete process.env.GITHUB_TOKEN;

      const res = await POST(makeRequest({
        title: "Test",
        body: "Body",
        labels: ["contact"],
      }));
      expect(res.status).toBe(500);
    });

    it("returns 500 when GITHUB_OWNER is missing", async () => {
      delete process.env.GITHUB_OWNER;

      const res = await POST(makeRequest({
        title: "Test",
        body: "Body",
        labels: ["contact"],
      }));
      expect(res.status).toBe(500);
    });

    it("returns 500 when GITHUB_REPO is missing", async () => {
      delete process.env.GITHUB_REPO;

      const res = await POST(makeRequest({
        title: "Test",
        body: "Body",
        labels: ["contact"],
      }));
      expect(res.status).toBe(500);
    });
  });
});
