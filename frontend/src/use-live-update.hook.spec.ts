import { act, renderHook } from "@testing-library/react";
import { Ketcher } from "ketcher-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LIVE_UPDATE_DEBOUNCE_MS, useLiveUpdate } from "./use-live-update.hook";

const BENZENE = "C1C=CC=CC=1";
const CHANGE_COUNT = 5;
const onMoleculeChange = vi.fn();

interface IFakeKetcher {
  ketcher: Ketcher;
  emitChange: () => void;
  unsubscribe: ReturnType<typeof vi.fn>;
}

const createFakeKetcher = (): IFakeKetcher => {
  const handlers = new Set<() => void>();
  const unsubscribe = vi.fn((_eventName: string, handler: () => void) =>
    handlers.delete(handler),
  );
  const editor = {
    subscribe: (_eventName: string, handler: () => void) => {
      handlers.add(handler);
      return handler;
    },
    unsubscribe,
  };
  const ketcher = { editor } as unknown as Ketcher;
  const emitChange = () => handlers.forEach((handler) => handler());
  return { ketcher, emitChange, unsubscribe };
};

const advancePastDebounce = () =>
  act(() => vi.advanceTimersByTimeAsync(LIVE_UPDATE_DEBOUNCE_MS));

describe("useLiveUpdate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it("should send the molecule once after the debounce", async () => {
    const { ketcher, emitChange } = createFakeKetcher();
    const serialize = vi.fn(async () => BENZENE);
    renderHook(() => useLiveUpdate(ketcher, true, serialize, onMoleculeChange));

    for (let index = 0; index < CHANGE_COUNT; index++) {
      emitChange();
    }
    expect(onMoleculeChange).not.toHaveBeenCalled();
    await advancePastDebounce();

    expect(onMoleculeChange).toHaveBeenCalledExactlyOnceWith(BENZENE);
  });

  it("should not send the same molecule twice", async () => {
    const { ketcher, emitChange } = createFakeKetcher();
    renderHook(() =>
      useLiveUpdate(ketcher, true, async () => BENZENE, onMoleculeChange),
    );

    emitChange();
    await advancePastDebounce();
    emitChange();
    await advancePastDebounce();

    expect(onMoleculeChange).toHaveBeenCalledOnce();
  });

  it("should recognise the last sent molecule as an echo from Python", async () => {
    const { ketcher, emitChange } = createFakeKetcher();
    const { result } = renderHook(() =>
      useLiveUpdate(ketcher, true, async () => BENZENE, onMoleculeChange),
    );

    emitChange();
    await advancePastDebounce();

    expect(result.current.isLastSentMolecule(BENZENE)).toBe(true);
    expect(result.current.isLastSentMolecule("CCO")).toBe(false);
  });

  it("should not send anything when disabled", async () => {
    const { ketcher, emitChange } = createFakeKetcher();
    renderHook(() =>
      useLiveUpdate(ketcher, false, async () => BENZENE, onMoleculeChange),
    );

    emitChange();
    await advancePastDebounce();

    expect(onMoleculeChange).not.toHaveBeenCalled();
  });

  it("should unsubscribe and cancel the pending send on unmount", async () => {
    const { ketcher, emitChange, unsubscribe } = createFakeKetcher();
    const { unmount } = renderHook(() =>
      useLiveUpdate(ketcher, true, async () => BENZENE, onMoleculeChange),
    );

    emitChange();
    unmount();
    await advancePastDebounce();

    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(onMoleculeChange).not.toHaveBeenCalled();
  });
});
