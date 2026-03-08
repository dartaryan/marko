import { createRoot } from "react-dom/client";
import { act } from "react";
import { beforeEach, afterEach } from "vitest";
import type { ReactNode } from "react";

export function setupComponentTest() {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (root) {
      act(() => root!.unmount());
    }
    container?.remove();
    root = null;
  });

  function render(element: ReactNode) {
    act(() => {
      root = createRoot(container);
      root.render(element);
    });
  }

  function getContainer() {
    return container;
  }

  return { render, getContainer };
}
