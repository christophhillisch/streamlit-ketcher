import {
  KetcherWidget,
  IKetcherWidgetArgs,
  IKetcherWidgetProps,
} from "./ketcher-widget.component";
import {
  FORMAT_MOLFILE,
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

vi.mock("./streamlit-ketcher-editor.component", () => {
  let currentMolecule: string | null = null;
  let moleculeListener: ((mol: string) => void) | null = null;
  const mockKetcher = {
    setMolecule: async (mol: string) => {
      currentMolecule = mol;
      moleculeListener?.(mol);
    },
    getSmiles: () => "SMILES:" + currentMolecule,
    getMolfile: () => "MOLFILE:" + currentMolecule,
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
          {"molecule=" + JSON.stringify(currentMolecule)}]
        </div>
      );
    },
  };
});

function getArgs(args: Partial<IKetcherWidgetArgs> = {}): IKetcherWidgetArgs {
  return { molecule_format: "SMILES", height: 500, molecule: "CCO", ...args };
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

  it.each<[MoleculeFormatType, string]>([
    [FORMAT_SMILES, "CCO"],
    [FORMAT_MOLFILE, "CCCCC"],
  ])(
    "apply buttons should set molecule to parent frame",
    async (moleculeFormat, molecule) => {
      const props = getProps({
        args: getArgs({
          height: 800,
          molecule_format: moleculeFormat,
          molecule,
        }),
      });
      const setComponentValueMock = vi.mocked(Streamlit.setComponentValue).mock;

      const { getByRole } = render(<KetcherWidget {...props} />);
      const buttonApply = getByRole("button", {
        name: "Apply",
      }) as HTMLButtonElement;
      await waitFor(() => expect(buttonApply.disabled).toEqual(false));
      fireEvent.click(buttonApply);

      await waitFor(() => expect(setComponentValueMock.calls).toHaveLength(1));
      expect(setComponentValueMock.calls[0][0]).toEqual(
        `${moleculeFormat}:${molecule}`,
      );
    },
  );
});
