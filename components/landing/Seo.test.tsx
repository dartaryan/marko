import { describe, it, expect } from "vitest";
import { Seo } from "./Seo";
import { setupComponentTest } from "./test-utils";

const { render, getContainer } = setupComponentTest();

describe("Seo", () => {
  function getJsonLd() {
    render(<Seo />);
    const script = getContainer().querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    return JSON.parse(script!.textContent!);
  }

  it("renders a script tag with application/ld+json type", () => {
    render(<Seo />);
    const script = getContainer().querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
  });

  it("contains SoftwareApplication schema type", () => {
    const data = getJsonLd();
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("SoftwareApplication");
  });

  it("includes required schema fields", () => {
    const data = getJsonLd();
    expect(data.name).toBe("מארקו");
    expect(data.description).toBeTruthy();
    expect(data.url).toBeTruthy();
    expect(data.applicationCategory).toBe("Multimedia");
    expect(data.operatingSystem).toBe("Web");
    expect(data.inLanguage).toBe("he");
  });

  it("includes free offer", () => {
    const data = getJsonLd();
    expect(data.offers).toBeDefined();
    expect(data.offers["@type"]).toBe("Offer");
    expect(data.offers.price).toBe("0");
    expect(data.offers.priceCurrency).toBe("ILS");
  });

  it("includes screenshot property pointing to OG image", () => {
    const data = getJsonLd();
    expect(data.screenshot).toBeDefined();
    expect(data.screenshot).toContain("/opengraph-image");
  });

  it("does not contain unescaped < characters (XSS safety)", () => {
    render(<Seo />);
    const script = getContainer().querySelector('script[type="application/ld+json"]');
    const raw = script!.innerHTML;
    // Verify no raw < characters exist in the JSON-LD content
    // The replace(/</g, "\\u003c") in Seo.tsx should escape all angle brackets
    expect(raw).not.toContain("<");
  });
});
