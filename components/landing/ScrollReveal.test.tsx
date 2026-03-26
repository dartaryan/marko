import React from "react";
import { describe, it, expect, vi } from "vitest";
import { setupComponentTest } from "./test-utils";

const mockUseReducedMotion = vi.fn();

vi.mock("framer-motion", () => ({
  m: {
    div: React.forwardRef(({ children, initial: _i, whileInView: _w, viewport: _v, transition: _t, ...props }: Record<string, unknown> & { children?: React.ReactNode }, ref: React.Ref<HTMLDivElement>) =>
      React.createElement("div", { ...props, ref } as React.HTMLAttributes<HTMLDivElement>, children as React.ReactNode)
    ),
  },
  useReducedMotion: () => mockUseReducedMotion(),
}));

import { ScrollReveal } from "./ScrollReveal";

const { render, getContainer } = setupComponentTest();

describe("ScrollReveal", () => {
  it("renders children when motion is enabled", () => {
    mockUseReducedMotion.mockReturnValue(false);
    render(
      <ScrollReveal>
        <p>Animated content</p>
      </ScrollReveal>
    );
    expect(getContainer().textContent).toContain("Animated content");
  });

  it("wraps children in a div when motion is enabled", () => {
    mockUseReducedMotion.mockReturnValue(false);
    render(
      <ScrollReveal>
        <span>Inner</span>
      </ScrollReveal>
    );
    const wrapper = getContainer().querySelector("div > span");
    expect(wrapper).not.toBeNull();
  });

  it("renders children when reduced motion is preferred", () => {
    mockUseReducedMotion.mockReturnValue(true);
    render(
      <ScrollReveal>
        <p>Static content</p>
      </ScrollReveal>
    );
    expect(getContainer().textContent).toContain("Static content");
    // Still wraps in m.div for hydration consistency, but no animation props
    const wrapper = getContainer().querySelector("div > p");
    expect(wrapper).not.toBeNull();
  });
});
