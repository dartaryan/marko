import { describe, it, expect } from "vitest";
import robots from "./robots";

describe("robots", () => {
  const config = robots();

  it("returns robots config with rules", () => {
    expect(config.rules).toBeDefined();
  });

  it("allows all crawlers on /", () => {
    const rules = config.rules as { userAgent: string; allow: string };
    expect(rules.userAgent).toBe("*");
    expect(rules.allow).toBe("/");
  });

  it("disallows /editor, /settings, and /subscription", () => {
    const rules = config.rules as { disallow: string[] };
    expect(rules.disallow).toContain("/editor");
    expect(rules.disallow).toContain("/settings");
    expect(rules.disallow).toContain("/subscription");
  });

  it("disallows exactly 3 routes", () => {
    const rules = config.rules as { disallow: string[] };
    expect(rules.disallow).toHaveLength(3);
  });

  it("references sitemap URL", () => {
    expect(config.sitemap).toBeDefined();
    expect(config.sitemap).toContain("/sitemap.xml");
  });
});
