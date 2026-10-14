import { act, renderHook } from "@testing-library/react";
import { Ketcher } from "ketcher-core";
import { Streamlit } from "streamlit-component-lib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LIVE_UPDATE_DEBOUNCE_MS, useLiveUpdate } from "./use-live-update.hook";

const BENZENE = "C1C=CC=CC=1";
const CHANGE_COUNT = 5;

interface IFakeKetcher {
  ketcher: Ketcher;
  emitChange: () => void;
  setTemplatePreview: (isShown: boolean) => void;
  unsubscribe: ReturnType<typeof vi.fn>;
}

interface IFakeStructureItem {
  isPreview: boolean;
}

const PREVIEW_ATOM_ID = 1;

const createFakeKetcher = (): IFakeKetcher => {
  const handlers = new Set<() => void>();
  const atoms = new Map<number, IFakeStructureItem>();
  const bonds = new Map<number, IFakeStructureItem>();
  const unsubscribe = vi.fn((_eventName: string, handler: () => void) =>
    handlers.delete(handler),
  );
  const editor = {
    subscribe: (_eventName: string, handler: () => void) => {
      handlers.add(handler);
      return handler;
    },
    unsubscribe,
    struct: () => ({ atoms, bonds }),
  };
  const ketcher = { editor } as unknown as Ketcher;
  const emitChange = () => handlers.forEach((handler) => handler());
  const setTemplatePreview = (isShown: boolean) =>
    isShown
      ? atoms.set(PREVIEW_ATOM_ID, { isPreview: true })
      : atoms.delete(PREVIEW_ATOM_ID);
  return { ketcher, emitChange, setTemplatePreview, unsubscribe };
};

const advancePastDebounce = () =>
  act(() => vi.advanceTimersByTimeAsync(LIVE_UPDATE_DEBOUNCE_MS));

describe("useLiveUpdate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Streamlit, "setComponentValue");
  });

  afterEach(() => vi.useRealTimers());

  it("should send the molecule once after the debounce", async () => {
    const { ketcher, emitChange } = createFakeKetcher();
    const serialize = vi.fn(async () => BENZENE);
    renderHook(() => useLiveUpdate(ketcher, true, serialize));

    for (let index = 0; index < CHANGE_COUNT; index++) {
      emitChange();
    }
    expect(Streamlit.setComponentValue).not.toHaveBeenCalled();
    await advancePastDebounce();

    expect(Streamlit.setComponentValue).toHaveBeenCalledExactlyOnceWith(
      BENZENE,
    );
  });

  it("should not send the same molecule twice", async () => {
    const { ketcher, emitChange } = createFakeKetcher();
    renderHook(() => useLiveUpdate(ketcher, true, async () => BENZENE));

    emitChange();
    await advancePastDebounce();
    emitChange();
    await advancePastDebounce();

    expect(Streamlit.setComponentValue).toHaveBeenCalledOnce();
  });

  it("should recognise the last sent molecule as an echo from Python", async () => {
    const { ketcher, emitChange } = createFakeKetcher();
    const { result } = renderHook(() =>
      useLiveUpdate(ketcher, true, async () => BENZENE),
    );

    emitChange();
    await advancePastDebounce();

    expect(result.current.isLastSentMolecule(BENZENE)).toBe(true);
    expect(result.current.isLastSentMolecule("CCO")).toBe(false);
  });

  it("should wait until the template preview is gone before sending", async () => {
    const { ketcher, emitChange, setTemplatePreview } = createFakeKetcher();
    renderHook(() => useLiveUpdate(ketcher, true, async () => BENZENE));

    emitChange();
    setTemplatePreview(true);
    await advancePastDebounce();
    await advancePastDebounce();
    expect(Streamlit.setComponentValue).not.toHaveBeenCalled();

    setTemplatePreview(false);
    await advancePastDebounce();

    expect(Streamlit.setComponentValue).toHaveBeenCalledExactlyOnceWith(
      BENZENE,
    );
  });

  it("should stop waiting for the template preview on unmount", async () => {
    const { ketcher, emitChange, setTemplatePreview } = createFakeKetcher();
    const { unmount } = renderHook(() =>
      useLiveUpdate(ketcher, true, async () => BENZENE),
    );

    emitChange();
    setTemplatePreview(true);
    await advancePastDebounce();
    unmount();
    setTemplatePreview(false);
    await advancePastDebounce();

    expect(Streamlit.setComponentValue).not.toHaveBeenCalled();
  });

  it("should not send anything when disabled", async () => {
    const { ketcher, emitChange } = createFakeKetcher();
    renderHook(() => useLiveUpdate(ketcher, false, async () => BENZENE));

    emitChange();
    await advancePastDebounce();

    expect(Streamlit.setComponentValue).not.toHaveBeenCalled();
  });

  it("should unsubscribe and cancel the pending send on unmount", async () => {
    const { ketcher, emitChange, unsubscribe } = createFakeKetcher();
    const { unmount } = renderHook(() =>
      useLiveUpdate(ketcher, true, async () => BENZENE),
    );

    emitChange();
    unmount();
    await advancePastDebounce();

    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(Streamlit.setComponentValue).not.toHaveBeenCalled();
  });
});
