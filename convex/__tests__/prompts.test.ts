import { describe, it, expect } from "vitest";
import { getSystemPrompt } from "../prompts";

describe("getSystemPrompt", () => {
  it("returns a non-empty string for summarize", () => {
    const prompt = getSystemPrompt("summarize");
    expect(prompt).toBeTruthy();
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("returns a non-empty string for translate", () => {
    const prompt = getSystemPrompt("translate");
    expect(prompt).toBeTruthy();
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("returns a non-empty string for extractActions", () => {
    const prompt = getSystemPrompt("extractActions");
    expect(prompt).toBeTruthy();
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("returns a non-empty string for improveWriting", () => {
    const prompt = getSystemPrompt("improveWriting");
    expect(prompt).toBeTruthy();
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("summarize prompt mentions summary-related keywords", () => {
    const prompt = getSystemPrompt("summarize");
    expect(prompt.toLowerCase()).toContain("summar");
  });

  it("translate prompt mentions translation-related keywords", () => {
    const prompt = getSystemPrompt("translate");
    expect(prompt.toLowerCase()).toContain("translat");
  });

  it("extractActions prompt mentions task/action-related keywords", () => {
    const prompt = getSystemPrompt("extractActions");
    expect(prompt.toLowerCase()).toContain("task");
  });

  it("improveWriting prompt mentions improvement-related keywords", () => {
    const prompt = getSystemPrompt("improveWriting");
    expect(prompt.toLowerCase()).toContain("improv");
  });

  it("all prompts mention Hebrew context", () => {
    const actionTypes = ["summarize", "translate", "extractActions", "improveWriting"] as const;
    for (const actionType of actionTypes) {
      const prompt = getSystemPrompt(actionType);
      expect(prompt.toLowerCase()).toMatch(/hebrew|language/i);
    }
  });
});
