import { describe, it, expect } from "vitest";
import robots from "./robots";

describe("robots", () => {
  const config = robots();

  it("returns robots config with rules", () => {
    expect(config.rules).toBeDefined();
  });

  it("allows all crawlers on /", () => {
    const rules = config.rules as { userAgent: string; allow: string; disallow: string };
    expect(rules.userAgent).toBe("*");
    expect(rules.allow).toBe("/");
  });

  it("disallows /editor", () => {
    const rules = config.rules as { disallow: string };
    expect(rules.disallow).toBe("/editor");
  });

  it("references sitemap URL", () => {
    expect(config.sitemap).toBeDefined();
    expect(config.sitemap).toContain("/sitemap.xml");
  });
});
