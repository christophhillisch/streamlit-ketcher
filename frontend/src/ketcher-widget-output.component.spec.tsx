import { KetcherWidget } from "./ketcher-widget.component";
import { getArgs, getProps, setMoleculeMock } from "./ketcher-widget.fixtures";
import {
  FORMAT_CXSMILES,
  FORMAT_INCHI,
  FORMAT_INCHI_KEY,
  FORMAT_KET,
  FORMAT_MOLFILE,
  FORMAT_RXN,
  FORMAT_SMARTS,
  FORMAT_SMILES,
  MoleculeFormatType,
} from "./use-ketcher-editor.hook";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Streamlit } from "streamlit-component-lib";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock(
  "./streamlit-ketcher-editor.component",
  () => import("./ketcher-widget.mock"),
);

describe("KetcherWidget output", () => {
  beforeAll(() => {
    vi.spyOn(Streamlit, "setFrameHeight");
    vi.spyOn(Streamlit, "setComponentValue");
  });

  it.each<[MoleculeFormatType, string]>([
    [FORMAT_SMILES, "CCO"],
    [FORMAT_MOLFILE, "CCCCC"],
    [FORMAT_KET, "CCO"],
    [FORMAT_CXSMILES, "CCO"],
    [FORMAT_INCHI, "InChI=1S/C2H6O/c1-2-3/h3H,2H2,1H3"],
    [FORMAT_INCHI_KEY, "CCO"],
    [FORMAT_SMARTS, "[#6]-[#6]"],
    [FORMAT_RXN, "CCO>>CC=O"],
  ])(
    "apply button should set the %s molecule to parent frame",
    async (moleculeFormat, molecule) => {
      const props = getProps({
        args: getArgs({
          height: 800,
          molecule_format: moleculeFormat,
          molecule,
        }),
      });
      const setComponentValueMock = vi.mocked(Streamlit.setComponentValue).mock;

      const { getByRole, queryByText } = render(<KetcherWidget {...props} />);
      const buttonApply = getByRole("button", {
        name: "Apply",
      }) as HTMLButtonElement;
      await waitFor(() => expect(buttonApply.disabled).toEqual(false));
      await waitFor(() =>
        expect(
          queryByText(`molecule=${JSON.stringify(molecule)}`, { exact: false }),
        ).not.toBeNull(),
      );
      fireEvent.click(buttonApply);

      await waitFor(() => expect(setComponentValueMock.calls).toHaveLength(1));
      expect(setComponentValueMock.calls[0][0]).toEqual(
        `${moleculeFormat}:${molecule}`,
      );
    },
  );

  it("apply button should be hidden in live update mode", async () => {
    const props = getProps({ args: getArgs({ live_update: true }) });

    const { getByRole, queryByRole } = render(<KetcherWidget {...props} />);
    await waitFor(() => {
      expect(
        (getByRole("button", { name: "Reset" }) as HTMLButtonElement).disabled,
      ).toEqual(false);
    });

    expect(queryByRole("button", { name: "Apply" })).toBeNull();
  });

  it("live update should send the loaded molecule without reloading its echo", async () => {
    const props = getProps({
      args: getArgs({ live_update: true, molecule: "CCO" }),
    });
    const setComponentValueMock = vi.mocked(Streamlit.setComponentValue).mock;

    const { rerender } = render(<KetcherWidget {...props} />);
    await waitFor(() => expect(setComponentValueMock.calls).toHaveLength(1));
    expect(setComponentValueMock.calls[0][0]).toEqual("SMILES:CCO");
    rerender(
      <KetcherWidget
        {...props}
        args={getArgs({ live_update: true, molecule: "SMILES:CCO" })}
      />,
    );

    expect(setMoleculeMock).toHaveBeenCalledExactlyOnceWith("CCO");
  });
});
