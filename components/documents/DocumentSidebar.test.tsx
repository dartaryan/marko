import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import type { Document } from "@/types/document";

// Mock the Sheet component to avoid Radix Dialog portal issues in tests
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? React.createElement("div", { "data-testid": "sheet" }, children) : null,
  SheetContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "sheet-content", className: "lg:hidden" }, children),
  SheetHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  SheetTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement("h2", null, children),
  SheetDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement("p", null, children),
}));

// Mock dropdown menu
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "dropdown-menu" }, children),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { role: "menu" }, children),
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) =>
    React.createElement("button", { role: "menuitem", onClick }, children),
}));

// Mock alert dialog
vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? React.createElement("div", { "data-testid": "alert-dialog" }, children) : null,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement("h2", null, children),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement("p", null, children),
  AlertDialogAction: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) =>
    React.createElement("button", { onClick }, children),
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) =>
    React.createElement("button", null, children),
}));

// Stub matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Import AFTER mocks
const { DocumentSidebar } = await import("./DocumentSidebar");

function makeDoc(overrides: Partial<Document> = {}): Document {
  return {
    id: crypto.randomUUID(),
    content: "# Test Doc\nSome content",
    title: "Test Doc",
    snippet: "Some content",
    themeId: "",
    direction: "auto",
    createdAt: Date.now() - 1000,
    updatedAt: Date.now(),
    isPinned: false,
    ...overrides,
  };
}

const createDefaultProps = () => ({
  isOpen: true,
  onOpenChange: vi.fn(),
  documents: [] as Document[],
  activeDocumentId: null as string | null,
  isLoading: false,
  onSelectDocument: vi.fn(),
  onCreateDocument: vi.fn(),
  onPinDocument: vi.fn(),
  onDeleteDocument: vi.fn(),
  onDuplicateDocument: vi.fn(),
  searchQuery: "",
  onSearchChange: vi.fn(),
  filteredDocuments: [] as Document[],
});

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  vi.clearAllMocks();
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

describe("DocumentSidebar", () => {
  it("shows empty state when no documents", () => {
    const props = createDefaultProps();
    act(() => {
      root = createRoot(container);
      root.render(<DocumentSidebar {...props} />);
    });
    expect(container.textContent).toContain("אין מסמכים עדיין");
    expect(container.textContent).toContain("מסמך חדש");
  });

  it("calls onCreateDocument when empty state button clicked", () => {
    const props = createDefaultProps();
    act(() => {
      root = createRoot(container);
      root.render(<DocumentSidebar {...props} />);
    });
    // The empty state "מסמך חדש" button
    const buttons = Array.from(container.querySelectorAll("button"));
    const createBtn = buttons.find((b) => b.textContent?.includes("מסמך חדש"));
    act(() => {
      createBtn?.click();
    });
    expect(props.onCreateDocument).toHaveBeenCalled();
  });

  it("renders document list when documents exist", () => {
    const doc1 = makeDoc({ title: "Document A", snippet: "First doc" });
    const doc2 = makeDoc({ title: "Document B", snippet: "Second doc" });
    const docs = [doc1, doc2];
    const props = createDefaultProps();

    act(() => {
      root = createRoot(container);
      root.render(
        <DocumentSidebar
          {...props}
          documents={docs}
          filteredDocuments={docs}
          activeDocumentId={doc1.id}
        />
      );
    });
    expect(container.textContent).toContain("Document A");
    expect(container.textContent).toContain("Document B");
    expect(container.textContent).toContain("First doc");
  });

  it("highlights active document", () => {
    const doc = makeDoc({ title: "Active Doc" });
    const docs = [doc];
    const props = createDefaultProps();

    act(() => {
      root = createRoot(container);
      root.render(
        <DocumentSidebar
          {...props}
          documents={docs}
          filteredDocuments={docs}
          activeDocumentId={doc.id}
        />
      );
    });
    const option = container.querySelector('[role="option"][aria-selected="true"]');
    expect(option).toBeTruthy();
  });

  it("shows loading skeleton when isLoading", () => {
    const props = createDefaultProps();
    act(() => {
      root = createRoot(container);
      root.render(<DocumentSidebar {...props} isLoading={true} />);
    });
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows no-results message when search yields nothing", () => {
    const doc = makeDoc({ title: "Hello" });
    const props = createDefaultProps();
    act(() => {
      root = createRoot(container);
      root.render(
        <DocumentSidebar
          {...props}
          documents={[doc]}
          filteredDocuments={[]}
          searchQuery="xyz"
        />
      );
    });
    expect(container.textContent).toContain("לא נמצאו מסמכים");
  });

  it("shows pinned indicator for pinned documents", () => {
    const doc = makeDoc({ title: "Pinned Doc", isPinned: true });
    const props = createDefaultProps();
    act(() => {
      root = createRoot(container);
      root.render(
        <DocumentSidebar
          {...props}
          documents={[doc]}
          filteredDocuments={[doc]}
        />
      );
    });
    const pinLabel = container.querySelector('[aria-label="מוצמד"]');
    expect(pinLabel).toBeTruthy();
  });

  it("calls onSelectDocument when document clicked", () => {
    const doc = makeDoc({ title: "Clickable" });
    const props = createDefaultProps();
    act(() => {
      root = createRoot(container);
      root.render(
        <DocumentSidebar
          {...props}
          documents={[doc]}
          filteredDocuments={[doc]}
        />
      );
    });
    const option = container.querySelector('[role="option"]') as HTMLElement;
    act(() => {
      option?.click();
    });
    expect(props.onSelectDocument).toHaveBeenCalledWith(doc.id);
  });

  it("does not render desktop sidebar when closed", () => {
    const props = createDefaultProps();
    act(() => {
      root = createRoot(container);
      root.render(<DocumentSidebar {...props} isOpen={false} />);
    });
    const sidebar = container.querySelector(".marko-document-sidebar");
    expect(sidebar).toBeNull();
  });

  it("renders search input when documents exist", () => {
    const doc = makeDoc();
    const props = createDefaultProps();
    act(() => {
      root = createRoot(container);
      root.render(
        <DocumentSidebar
          {...props}
          documents={[doc]}
          filteredDocuments={[doc]}
        />
      );
    });
    const searchInput = container.querySelector('input[type="search"]');
    expect(searchInput).toBeTruthy();
  });

  it("renders sidebar heading", () => {
    const doc = makeDoc();
    const props = createDefaultProps();
    act(() => {
      root = createRoot(container);
      root.render(
        <DocumentSidebar
          {...props}
          documents={[doc]}
          filteredDocuments={[doc]}
        />
      );
    });
    expect(container.textContent).toContain("מסמכים");
  });

  it("renders new document button in header when documents exist", () => {
    const doc = makeDoc();
    const props = createDefaultProps();
    act(() => {
      root = createRoot(container);
      root.render(
        <DocumentSidebar
          {...props}
          documents={[doc]}
          filteredDocuments={[doc]}
        />
      );
    });
    const newDocBtn = container.querySelector('[aria-label="מסמך חדש"]');
    expect(newDocBtn).toBeTruthy();
  });
});
