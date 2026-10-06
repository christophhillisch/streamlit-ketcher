import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StreamlitKetcherEditor } from "./streamlit-ketcher-editor.component";

const EDITOR_HEIGHT = 500;

const { editorMock } = vi.hoisted(() => ({ editorMock: vi.fn(() => null) }));

vi.mock("ketcher-react", () => ({ Editor: editorMock }));
vi.mock("ketcher-standalone/dist/binaryWasm", () => ({
  StandaloneStructServiceProvider: class {},
}));

describe("StreamlitKetcherEditor", () => {
  it.each([true, false])(
    "should pass disableMacromoleculesEditor=%s to the Ketcher editor",
    (disableMacromoleculesEditor) => {
      render(
        <StreamlitKetcherEditor
          height={EDITOR_HEIGHT}
          errorHandler={vi.fn()}
          disableMacromoleculesEditor={disableMacromoleculesEditor}
        />,
      );

      expect(editorMock).toHaveBeenCalledWith(
        expect.objectContaining({ disableMacromoleculesEditor }),
        undefined,
      );
    },
  );
});
