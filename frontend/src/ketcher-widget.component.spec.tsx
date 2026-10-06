import {
  KetcherWidget,
  IKetcherWidgetArgs,
  IKetcherWidgetProps,
} from "./ketcher-widget.component";
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
import { darkTheme } from "./mocks";
import { StreamlitKetcherEditorProps } from "./streamlit-ketcher-editor.component";
import { Ketcher } from "ketcher-core";
import { Streamlit } from "streamlit-component-lib";
import { useEffect, useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

const { setMoleculeMock } = vi.hoisted(() => ({ setMoleculeMock: vi.fn() }));

vi.mock("./streamlit-ketcher-editor.component", () => {
  let currentMolecule: string | null = null;
  let moleculeListener: ((mol: string) => void) | null = null;
  let changeHandler: (() => void) | null = null;
  const mockKetcher = {
    setMolecule: async (mol: string) => {
      setMoleculeMock(mol);
      currentMolecule = mol;
      moleculeListener?.(mol);
      changeHandler?.();
    },
    editor: {
      subscribe: (_eventName: string, handler: () => void) => {
        changeHandler = handler;
        return handler;
      },
      unsubscribe: () => {
        changeHandler = null;
      },
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

  const MockStreamlitKetcherEditor = (props: StreamlitKetcherEditorProps) => {
    const { onInit } = props;
    const [, setMolecule] = useState<string>();
    moleculeListener = setMolecule;
    useEffect(() => {
      const timer = setTimeout(
        () => onInit!(mockKetcher as unknown as Ketcher),
        0,
      );

      return () => clearTimeout(timer);
    }, [onInit]);

    return (
      <div>
        StreamlitKetcherEditor [{"molecule=" + JSON.stringify(currentMolecule)}
        {" disableMacromoleculesEditor=" +
          String(props.disableMacromoleculesEditor)}
        ]
      </div>
    );
  };

  return { default: MockStreamlitKetcherEditor };
});

function getArgs(args: Partial<IKetcherWidgetArgs> = {}): IKetcherWidgetArgs {
  return {
    molecule_format: "SMILES",
    height: 500,
    molecule: "CCO",
    macromolecules: false,
    live_update: false,
    ...args,
  };
}

function getProps(
  props: Partial<IKetcherWidgetProps> = {},
): IKetcherWidgetProps {
  return {
    args: getArgs(),
    disabled: true,
    width: 500,
    theme: darkTheme,
    ...props,
  };
}

describe("KetcherWidget", () => {
  beforeAll(() => {
    vi.spyOn(Streamlit, "setFrameHeight");
    vi.spyOn(Streamlit, "setComponentValue");
  });

  it("should respect height of component and update height of the parent frame ", () => {
    const props = getProps({ args: getArgs({ height: 8000 }) });
    render(<KetcherWidget {...props} />);

    expect(vi.mocked(Streamlit.setFrameHeight).mock.calls).toHaveLength(1);
  });

  it("component should be disabled initially", () => {
    const props = getProps({ args: getArgs({ height: 8000 }) });

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
    const props = getProps({ args: getArgs({ height: 8000 }) });

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
    const props = getProps({ args: getArgs({ molecule: "NEW_MOLECULE" }) });

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
    const props = getProps({ args: getArgs({ molecule: "FIRST_MOLECULE" }) });

    const { getByRole, queryByText, rerender } = render(
      <KetcherWidget {...props} />,
    );
    await waitFor(() => {
      expect(
        (getByRole("button", { name: "Apply" }) as HTMLButtonElement).disabled,
      ).toEqual(false);
    });
    rerender(
      <KetcherWidget
        {...props}
        args={getArgs({ molecule: "SECOND_MOLECULE" })}
      />,
    );

    await waitFor(() => {
      expect(queryByText(/molecule="SECOND_MOLECULE"/)).not.toBeNull();
    });
  });

  it("reset buttons should set empty molecule", async () => {
    const props = getProps({ args: getArgs({ molecule: "USER_MOLECULE" }) });

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
      const props = getProps({ args: getArgs({ macromolecules }) });

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
