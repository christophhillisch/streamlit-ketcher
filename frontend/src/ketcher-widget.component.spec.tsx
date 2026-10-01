import { KetcherWidget, IKetcherWidgetProps } from "./ketcher-widget.component";
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
import { StreamlitKetcherEditorProps } from "./streamlit-ketcher-editor.component";
import { Ketcher } from "ketcher-core";
import { useEffect, useState } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./streamlit-ketcher-editor.component", () => {
  let currentMolecule: string | null = null;
  let moleculeListener: ((mol: string) => void) | null = null;
  const mockKetcher = {
    setMolecule: async (mol: string) => {
      currentMolecule = mol;
      moleculeListener?.(mol);
    },
    getSmiles: (isExtended?: boolean) =>
      (isExtended ? "CXSMILES:" : "SMILES:") + currentMolecule,
    getMolfile: () => "MOLFILE:" + currentMolecule,
    getKet: () => "KET:" + currentMolecule,
    getInchi: () => "INCHI:" + currentMolecule,
    getInChIKey: () => "INCHI_KEY:" + currentMolecule,
    getSmarts: () => "SMARTS:" + currentMolecule,
    getRxn: () => "RXN:" + currentMolecule,
  };

  return {
    default: (props: StreamlitKetcherEditorProps) => {
      const [, setMolecule] = useState<string>();
      moleculeListener = setMolecule;
      useEffect(() => {
        const timer = setTimeout(
          () => props.onInit!(mockKetcher as unknown as Ketcher),
          0,
        );

        return () => clearTimeout(timer);
      }, []);

      return (
        <div>
          StreamlitKetcherEditor [
          {"molecule=" + JSON.stringify(currentMolecule)}
          {" disableMacromoleculesEditor=" +
            String(props.disableMacromoleculesEditor)}
          ]
        </div>
      );
    },
  };
});

function getProps(
  props: Partial<IKetcherWidgetProps> = {},
): IKetcherWidgetProps {
  return {
    molecule: "CCO",
    height: 500,
    moleculeFormat: FORMAT_SMILES,
    macromolecules: false,
    staticResourcesUrl: "http://localhost/assets",
    onApply: vi.fn(),
    ...props,
  };
}

describe("KetcherWidget", () => {
  it("component should be disabled initially", () => {
    const props = getProps({ height: 8000 });

    const { getByTestId, getByRole } = render(<KetcherWidget {...props} />);

    expect(
      (getByRole("button", { name: "Apply" }) as HTMLButtonElement).disabled,
    ).toEqual(true);
    expect(
      (getByRole("button", { name: "Reset" }) as HTMLButtonElement).disabled,
    ).toEqual(true);
    expect(getByTestId("loading-placeholder")).toBeVisible();
  });

  it("buttons should be enabled and placeholder should be invisible after ketcher intiialization", async () => {
    const props = getProps({ height: 8000 });

    const { queryByTestId, getByRole, queryByText } = render(
      <KetcherWidget {...props} />,
    );
    await waitFor(() => {
      expect(
        (getByRole("button", { name: "Apply" }) as HTMLButtonElement).disabled,
      ).toEqual(false);
    });

    expect(
      (getByRole("button", { name: "Reset" }) as HTMLButtonElement).disabled,
    ).toEqual(false);
    expect(queryByTestId("loading-placeholder")).toBeNull();
    expect(queryByText(/StreamlitKetcherEditor/)).not.toBeNull();
  });

  it("editor should have set molecule after ketcher initialization", async () => {
    const props = getProps({ molecule: "NEW_MOLECULE" });

    const { getByRole, queryByText } = render(<KetcherWidget {...props} />);
    await waitFor(() => {
      expect(
        (getByRole("button", { name: "Apply" }) as HTMLButtonElement).disabled,
      ).toEqual(false);
    });

    await waitFor(() =>
      expect(queryByText(/molecule="NEW_MOLECULE"/)).not.toBeNull(),
    );
  });

  it("editor should load a new molecule when the molecule arg changes", async () => {
    const props = getProps({ molecule: "FIRST_MOLECULE" });

    const { getByRole, queryByText, rerender } = render(
      <KetcherWidget {...props} />,
    );
    await waitFor(() => {
      expect(
        (getByRole("button", { name: "Apply" }) as HTMLButtonElement).disabled,
      ).toEqual(false);
    });
    rerender(<KetcherWidget {...props} molecule="SECOND_MOLECULE" />);

    await waitFor(() => {
      expect(queryByText(/molecule="SECOND_MOLECULE"/)).not.toBeNull();
    });
  });

  it("reset buttons should set empty molecule", async () => {
    const props = getProps({ molecule: "USER_MOLECULE" });

    const { getByRole, queryByText } = render(<KetcherWidget {...props} />);
    await waitFor(() => {
      expect(
        (getByRole("button", { name: "Apply" }) as HTMLButtonElement).disabled,
      ).toEqual(false);
    });
    await waitFor(() =>
      expect(queryByText(/molecule="USER_MOLECULE"/)).not.toBeNull(),
    );
    fireEvent.click(getByRole("button", { name: "Reset" }));

    await waitFor(() => {
      expect(queryByText(/molecule=""/)).not.toBeNull();
    });
  });

  it.each<[boolean, boolean]>([
    [false, true],
    [true, false],
  ])(
    "macromolecules=%s should pass disableMacromoleculesEditor=%s to the editor",
    (macromolecules, isMacromoleculesEditorDisabled) => {
      const props = getProps({ macromolecules });

      const { queryByText } = render(<KetcherWidget {...props} />);

      expect(
        queryByText(
          `disableMacromoleculesEditor=${isMacromoleculesEditorDisabled}`,
          { exact: false },
        ),
      ).not.toBeNull();
    },
  );

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
      const onApply = vi.fn();
      const props = getProps({
        height: 800,
        moleculeFormat,
        molecule,
        onApply,
      });

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

      await waitFor(() =>
        expect(onApply).toHaveBeenCalledExactlyOnceWith(
          `${moleculeFormat}:${molecule}`,
        ),
      );
    },
  );
});
