import { describe, it, expect, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Varela_Round: () => ({ variable: "--mock-font", className: "mock-font" }),
  JetBrains_Mono: () => ({ variable: "--mock-font", className: "mock-font" }),
}));

vi.mock("convex/react", () => ({
  ConvexReactClient: vi.fn(),
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("./ConvexClientProvider", () => ({
  ConvexClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { metadata } from "./layout";
import type { Metadata } from "next";

const meta = metadata as Metadata;

describe("layout metadata", () => {
  it("has metadataBase set", () => {
    expect(meta.metadataBase).toBeDefined();
  });

  it("has title with Hebrew keywords", () => {
    const title = meta.title as { default: string; template: string };
    expect(title.default).toContain("עורך מארקדאון");
    expect(title.default).toContain("מארקדאון");
  });

  it("has title template for child pages", () => {
    const title = meta.title as { default: string; template: string };
    expect(title.template).toBe("%s | מארקו");
  });

  it("has Hebrew description", () => {
    expect(meta.description).toContain("מארקו");
    expect(meta.description).toContain("מארקדאון");
  });

  it("has openGraph config", () => {
    expect(meta.openGraph).toBeDefined();
    const og = meta.openGraph as Record<string, unknown>;
    expect(og.title).toBeTruthy();
    expect(og.description).toBeTruthy();
    expect(og.url).toBeTruthy();
    expect(og.type).toBe("website");
    expect(og.locale).toBe("he_IL");
    expect(og.siteName).toBe("מארקו");
    expect(og.images).toBeDefined();
  });

  it("has twitter card config", () => {
    expect(meta.twitter).toBeDefined();
    const tw = meta.twitter as Record<string, unknown>;
    expect(tw.card).toBe("summary_large_image");
    expect(tw.title).toBeTruthy();
    expect(tw.description).toBeTruthy();
    expect(tw.images).toBeDefined();
  });

  it("references og-image in openGraph images", () => {
    const og = meta.openGraph as { images: Array<{ url: string }> };
    expect(og.images[0].url).toBe("/opengraph-image");
  });
});
