import React from "react";
import { describe, it, expect, vi } from "vitest";
import { setupComponentTest } from "@/components/landing/test-utils";

vi.mock("framer-motion", () => ({
  LazyMotion: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  domAnimation: {},
}));

import { MotionProvider } from "./MotionProvider";

const { render, getContainer } = setupComponentTest();

describe("MotionProvider", () => {
  it("renders children", () => {
    render(
      <MotionProvider>
        <div data-testid="child">Hello</div>
      </MotionProvider>
    );
    const child = getContainer().querySelector('[data-testid="child"]');
    expect(child).not.toBeNull();
    expect(child!.textContent).toBe("Hello");
  });

  it("renders multiple children", () => {
    render(
      <MotionProvider>
        <p>First</p>
        <p>Second</p>
      </MotionProvider>
    );
    const paragraphs = getContainer().querySelectorAll("p");
    expect(paragraphs).toHaveLength(2);
  });
});
