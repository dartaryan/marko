import { describe, it, expect } from "vitest";
import {
  getCapabilitiesForTier,
  TIER_CAPABILITIES,
  type CapabilityTier,
} from "./capabilities";

describe("TIER_CAPABILITIES", () => {
  it("defines capabilities for all three tiers", () => {
    expect(TIER_CAPABILITIES).toHaveProperty("anonymous");
    expect(TIER_CAPABILITIES).toHaveProperty("free");
    expect(TIER_CAPABILITIES).toHaveProperty("paid");
  });
});

describe("getCapabilitiesForTier", () => {
  describe("anonymous tier", () => {
    it("cannot use AI features", () => {
      const caps = getCapabilitiesForTier("anonymous");
      expect(caps.canUseAi).toBe(false);
      expect(caps.canUseSonnet).toBe(false);
      expect(caps.canUseOpus).toBe(false);
    });

    it("has no AI limits (no AI access)", () => {
      const caps = getCapabilitiesForTier("anonymous");
      expect(caps.hasAiLimit).toBe(false);
      expect(caps.maxMonthlyAiCalls).toBeNull();
      expect(caps.maxDailyOpusCalls).toBeNull();
    });
  });

  describe("free tier", () => {
    it("can use AI with Sonnet only", () => {
      const caps = getCapabilitiesForTier("free");
      expect(caps.canUseAi).toBe(true);
      expect(caps.canUseSonnet).toBe(true);
      expect(caps.canUseOpus).toBe(false);
    });

    it("has monthly AI limit", () => {
      const caps = getCapabilitiesForTier("free");
      expect(caps.hasAiLimit).toBe(true);
      expect(caps.maxMonthlyAiCalls).toBeGreaterThan(0);
      expect(caps.maxDailyOpusCalls).toBeNull();
    });
  });

  describe("paid tier", () => {
    it("can use all AI models", () => {
      const caps = getCapabilitiesForTier("paid");
      expect(caps.canUseAi).toBe(true);
      expect(caps.canUseSonnet).toBe(true);
      expect(caps.canUseOpus).toBe(true);
    });

    it("has no monthly AI limit but has daily Opus allocation", () => {
      const caps = getCapabilitiesForTier("paid");
      expect(caps.hasAiLimit).toBe(false);
      expect(caps.maxMonthlyAiCalls).toBeNull();
      expect(caps.maxDailyOpusCalls).toBeGreaterThan(0);
    });
  });

  it("returns same object as TIER_CAPABILITIES constant", () => {
    const tiers: CapabilityTier[] = ["anonymous", "free", "paid"];
    for (const tier of tiers) {
      expect(getCapabilitiesForTier(tier)).toBe(TIER_CAPABILITIES[tier]);
    }
  });
});
