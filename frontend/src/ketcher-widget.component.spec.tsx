import { KetcherWidget } from "./ketcher-widget.component";
import { getArgs, getProps } from "./ketcher-widget.fixtures";
import { EditorModeType } from "./editor-mode";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Streamlit } from "streamlit-component-lib";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock(
  "./streamlit-ketcher-editor.component",
  () => import("./ketcher-widget.mock"),
);

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

  it.each<EditorModeType>(["molecules", "macromolecules"])(
    "initial_mode=%s should be passed to the editor",
    (initialMode) => {
      const props = getProps({
        args: getArgs({ macromolecules: true, initial_mode: initialMode }),
      });

      const { queryByText } = render(<KetcherWidget {...props} />);

      expect(
        queryByText(`initialMode=${initialMode}`, { exact: false }),
      ).not.toBeNull();
    },
  );
});
