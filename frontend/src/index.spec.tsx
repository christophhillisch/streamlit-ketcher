import { act } from "react";
import { within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FrontendRendererArgs } from "@streamlit/component-v2-lib";
import renderKetcherComponent, {
  IKetcherComponentData,
  IKetcherComponentState,
} from "./index";
import { IKetcherWidgetProps } from "./ketcher-widget.component";
import { SINGLE_EDITOR_MESSAGE } from "./single-editor-notice.component";

const { receivedCallbacks } = vi.hoisted(() => ({
  receivedCallbacks: [] as unknown[],
}));

vi.mock("./ketcher-widget.component", () => ({
  KetcherWidget: ({ molecule, onMoleculeChange }: IKetcherWidgetProps) => {
    receivedCallbacks.push(onMoleculeChange);
    return (
      <button onClick={() => onMoleculeChange(`CHANGED:${molecule}`)}>
        {`widget molecule=${molecule}`}
      </button>
    );
  },
}));

type RendererArgsType = FrontendRendererArgs<
  IKetcherComponentState,
  IKetcherComponentData
>;

const createArgs = (
  parentElement: HTMLElement,
  molecule: string,
): RendererArgsType => ({
  data: {
    molecule,
    height: 500,
    molecule_format: "SMILES",
    macromolecules: false,
    live_update: true,
  },
  key: "ketcher-key",
  name: "streamlit_ketcher_editor.ketcher",
  parentElement,
  setStateValue: vi.fn(),
  setTriggerValue: vi.fn(),
});

const isCleanupFunction = (value: unknown): value is () => void =>
  typeof value === "function";

const renderInAct = (args: RendererArgsType): (() => void) => {
  let cleanup: unknown;
  act(() => {
    cleanup = renderKetcherComponent(args);
  });
  if (!isCleanupFunction(cleanup)) {
    throw new Error("Renderer must return a cleanup function");
  }
  return cleanup;
};

describe("renderKetcherComponent", () => {
  const parentElement = document.createElement("div");

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    parentElement.replaceChildren();
    receivedCallbacks.length = 0;
  });

  it("reuses one React root across reruns", () => {
    renderInAct(createArgs(parentElement, "CCO"));
    const cleanup = renderInAct(createArgs(parentElement, "C1=CC=CC=C1"));

    expect(parentElement.children).toHaveLength(1);
    expect(parentElement.textContent).toBe("widget molecule=C1=CC=CC=C1");
    act(() => cleanup());
  });

  it("unmounts the widget on cleanup", () => {
    const cleanup = renderInAct(createArgs(parentElement, "CCO"));

    act(() => cleanup());

    expect(parentElement.textContent).toBe("");
  });

  it("shows a notice instead of a second editor on the same page", () => {
    const secondParentElement = document.createElement("div");
    const firstCleanup = renderInAct(createArgs(parentElement, "CCO"));
    const secondCleanup = renderInAct(createArgs(secondParentElement, "CCN"));

    expect(parentElement.textContent).toBe("widget molecule=CCO");
    expect(within(secondParentElement).getByRole("alert").textContent).toBe(
      SINGLE_EDITOR_MESSAGE,
    );
    expect(console.error).toHaveBeenCalledWith(
      "[MULTIPLE_EDITORS] Only one Ketcher editor per page",
    );
    act(() => secondCleanup());
    act(() => firstCleanup());
  });

  it("activates the next editor when the first one is removed", () => {
    const secondParentElement = document.createElement("div");
    const firstCleanup = renderInAct(createArgs(parentElement, "CCO"));
    const secondCleanup = renderInAct(createArgs(secondParentElement, "CCN"));

    act(() => firstCleanup());

    expect(secondParentElement.textContent).toBe("widget molecule=CCN");
    act(() => secondCleanup());
  });

  it("stores the changed molecule in the component state", () => {
    const args = createArgs(parentElement, "CCO");
    const cleanup = renderInAct(args);

    act(() => within(parentElement).getByRole("button").click());

    expect(args.setStateValue).toHaveBeenCalledExactlyOnceWith(
      "molecule",
      "CHANGED:CCO",
    );
    act(() => cleanup());
  });

  it("keeps one change callback across reruns and sends with the latest state setter", () => {
    const firstArgs = createArgs(parentElement, "CCO");
    renderInAct(firstArgs);
    const rerunArgs = createArgs(parentElement, "CCN");
    const cleanup = renderInAct(rerunArgs);

    act(() => within(parentElement).getByRole("button").click());

    expect(new Set(receivedCallbacks).size).toBe(1);
    expect(firstArgs.setStateValue).not.toHaveBeenCalled();
    expect(rerunArgs.setStateValue).toHaveBeenCalledExactlyOnceWith(
      "molecule",
      "CHANGED:CCN",
    );
    act(() => cleanup());
  });
});
