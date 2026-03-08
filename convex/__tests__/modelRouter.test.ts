import { describe, it, expect } from "vitest";
import {
  MODEL_IDS,
  getModelForAction,
  getTokenCostForModel,
} from "../modelRouter";

describe("MODEL_IDS", () => {
  it("maps haiku to correct model ID", () => {
    expect(MODEL_IDS.haiku).toBe("claude-haiku-4-5-20251001");
  });

  it("maps sonnet to correct model ID", () => {
    expect(MODEL_IDS.sonnet).toBe("claude-sonnet-4-5-20250929");
  });

  it("maps opus to correct model ID", () => {
    expect(MODEL_IDS.opus).toBe("claude-opus-4-6");
  });
});

describe("getModelForAction", () => {
  it("routes summarize to Sonnet", () => {
    expect(getModelForAction("summarize", "free")).toBe(MODEL_IDS.sonnet);
  });

  it("routes translate to Sonnet", () => {
    expect(getModelForAction("translate", "free")).toBe(MODEL_IDS.sonnet);
  });

  it("routes extractActions to Sonnet", () => {
    expect(getModelForAction("extractActions", "free")).toBe(MODEL_IDS.sonnet);
  });

  it("routes improveWriting to Sonnet", () => {
    expect(getModelForAction("improveWriting", "free")).toBe(MODEL_IDS.sonnet);
  });

  it("routes paid user actions to Sonnet in Phase 1", () => {
    expect(getModelForAction("summarize", "paid")).toBe(MODEL_IDS.sonnet);
    expect(getModelForAction("translate", "paid")).toBe(MODEL_IDS.sonnet);
  });
});

describe("getTokenCostForModel", () => {
  it("calculates cost for Haiku correctly", () => {
    const cost = getTokenCostForModel("claude-haiku-4-5-20251001", 1_000_000, 1_000_000);
    expect(cost).toBeCloseTo(0.8 + 4.0);
  });

  it("calculates cost for Sonnet correctly", () => {
    const cost = getTokenCostForModel("claude-sonnet-4-5-20250929", 1_000_000, 1_000_000);
    expect(cost).toBeCloseTo(3.0 + 15.0);
  });

  it("calculates cost for Opus correctly", () => {
    const cost = getTokenCostForModel("claude-opus-4-6", 1_000_000, 1_000_000);
    expect(cost).toBeCloseTo(15.0 + 75.0);
  });

  it("calculates cost for small token counts", () => {
    const cost = getTokenCostForModel("claude-sonnet-4-5-20250929", 100, 50);
    expect(cost).toBeCloseTo((100 / 1_000_000) * 3.0 + (50 / 1_000_000) * 15.0);
  });

  it("returns 0 for unknown model", () => {
    expect(getTokenCostForModel("unknown-model", 1000, 500)).toBe(0);
  });
});
