import { act, renderHook, waitFor } from "@testing-library/react";
import { Ketcher } from "ketcher-core";
import { describe, expect, it, vi } from "vitest";
import { FORMAT_SMILES, useKetcherEditor } from "./use-ketcher-editor.hook";

interface IEditorHookProps {
  molecule: string;
}

const createSlowKetcher = () => {
  const finishLoads: Array<() => void> = [];
  const setMolecule = vi.fn(
    () => new Promise<void>((resolve) => finishLoads.push(resolve)),
  );
  const ketcher = {
    setMolecule,
    editor: { subscribe: vi.fn(), unsubscribe: vi.fn() },
  } as unknown as Ketcher;
  const finishOldestLoad = () => act(async () => finishLoads.shift()?.());
  return { ketcher, setMolecule, finishOldestLoad };
};

describe("useKetcherEditor", () => {
  it("should start a molecule load only after the previous one finished", async () => {
    const { ketcher, setMolecule, finishOldestLoad } = createSlowKetcher();
    const { result, rerender } = renderHook(
      ({ molecule }: IEditorHookProps) =>
        useKetcherEditor(molecule, FORMAT_SMILES, true, vi.fn()),
      { initialProps: { molecule: "CCN" } },
    );

    act(() => result.current.handleInit(ketcher));
    await waitFor(() => expect(setMolecule).toHaveBeenCalledWith("CCN"));
    rerender({ molecule: "CCO" });
    await act(async () => undefined);
    expect(setMolecule).toHaveBeenCalledOnce();

    await finishOldestLoad();

    await waitFor(() => expect(setMolecule).toHaveBeenLastCalledWith("CCO"));
    expect(setMolecule).toHaveBeenCalledTimes(2);
  });

  it("should not load an empty molecule into a fresh editor", async () => {
    const { ketcher, setMolecule } = createSlowKetcher();
    const { result } = renderHook(() =>
      useKetcherEditor("", FORMAT_SMILES, true, vi.fn()),
    );

    act(() => result.current.handleInit(ketcher));
    await act(async () => undefined);

    expect(setMolecule).not.toHaveBeenCalled();
  });

  it("should load an empty molecule once the editor has content", async () => {
    const { ketcher, setMolecule, finishOldestLoad } = createSlowKetcher();
    const { result, rerender } = renderHook(
      ({ molecule }: IEditorHookProps) =>
        useKetcherEditor(molecule, FORMAT_SMILES, true, vi.fn()),
      { initialProps: { molecule: "CCO" } },
    );

    act(() => result.current.handleInit(ketcher));
    await waitFor(() => expect(setMolecule).toHaveBeenCalledWith("CCO"));
    await finishOldestLoad();
    rerender({ molecule: "" });

    await waitFor(() => expect(setMolecule).toHaveBeenLastCalledWith(""));
  });
});
