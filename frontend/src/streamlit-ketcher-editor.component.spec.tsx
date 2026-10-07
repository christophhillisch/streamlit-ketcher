import { render, waitFor } from "@testing-library/react";
import { Ketcher } from "ketcher-core";
import { StrictMode, useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  StreamlitKetcherEditor,
  StreamlitKetcherEditorProps,
} from "./streamlit-ketcher-editor.component";

const EDITOR_HEIGHT = 500;
const STATIC_RESOURCES_URL = "http://localhost/assets";

const { editorMock, registeredKetcherIds } = vi.hoisted(() => ({
  editorMock: vi.fn<(props: StreamlitKetcherEditorProps) => null>(() => null),
  registeredKetcherIds: new Set<string>(),
}));

vi.mock("ketcher-react", () => ({ Editor: editorMock }));
vi.mock("ketcher-standalone", () => ({
  StandaloneStructServiceProvider: class {},
}));
vi.mock("ketcher-core", () => ({
  ketcherProvider: {
    getIndexById: (id: string) => [...registeredKetcherIds].indexOf(id),
  },
}));

let nextKetcherId = 1;

// Mirrors ketcher-react: each mount builds and registers a new instance, and
// the unmount unregisters it once the build has resolved.
const RemountingKetcherEditor = ({
  onInit,
}: StreamlitKetcherEditorProps): null => {
  useEffect(() => {
    const ketcher = { id: String(nextKetcherId++) } as unknown as Ketcher;
    registeredKetcherIds.add(ketcher.id);
    const buildPromise = Promise.resolve(ketcher);
    void buildPromise.then(onInit);

    return () =>
      void buildPromise.then(() => registeredKetcherIds.delete(ketcher.id));
  }, [onInit]);

  return null;
};

describe("StreamlitKetcherEditor", () => {
  afterEach(() => editorMock.mockReset());

  it.each([true, false])(
    "should pass disableMacromoleculesEditor=%s to the Ketcher editor",
    (disableMacromoleculesEditor) => {
      render(
        <StreamlitKetcherEditor
          height={EDITOR_HEIGHT}
          staticResourcesUrl={STATIC_RESOURCES_URL}
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

  it("should only pass on the Ketcher instance that survives a StrictMode remount", async () => {
    editorMock.mockImplementation(RemountingKetcherEditor);
    const handleInit = vi.fn<(ketcher: Ketcher) => void>();

    render(
      <StrictMode>
        <StreamlitKetcherEditor
          height={EDITOR_HEIGHT}
          staticResourcesUrl={STATIC_RESOURCES_URL}
          errorHandler={vi.fn()}
          onInit={handleInit}
        />
      </StrictMode>,
    );

    await waitFor(() => expect(handleInit).toHaveBeenCalled());
    const [[initializedKetcher]] = handleInit.mock.calls;
    expect(registeredKetcherIds).toContain(initializedKetcher.id);
    expect(handleInit).toHaveBeenCalledOnce();
  });
});
