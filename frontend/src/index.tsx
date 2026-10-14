import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import type {
  FrontendRenderer,
  FrontendRendererArgs,
  FrontendState,
} from "@streamlit/component-v2-lib";
import { IKetcherWidgetProps, KetcherWidget } from "./ketcher-widget.component";
import { SingleEditorNotice } from "./single-editor-notice.component";
import { MoleculeFormatType } from "./use-ketcher-editor.hook";

export interface IKetcherComponentData {
  readonly molecule: string | null;
  readonly height: number;
  readonly molecule_format: MoleculeFormatType;
  readonly macromolecules: boolean;
  readonly live_update: boolean;
}

export interface IKetcherComponentState extends FrontendState {
  molecule: string | null;
}

type KetcherRendererType = FrontendRenderer<
  IKetcherComponentState,
  IKetcherComponentData
>;
type SetStateValueType = FrontendRendererArgs<
  IKetcherComponentState,
  IKetcherComponentData
>["setStateValue"];
type ParentElementType = HTMLElement | ShadowRoot;

interface IMountedEditor {
  readonly root: Root;
  data: IKetcherComponentData;
  setStateValue: SetStateValueType;
  // Stable across reruns, so the live update listener is not resubscribed
  // (and its pending send cancelled) every time Streamlit rerenders.
  readonly onMoleculeChange: (serializedMolecule: string) => void;
}

// Ketcher loads "<url>/templates/..."; this module is served from asset_dir.
const STATIC_RESOURCES_URL = new URL(".", import.meta.url).href.replace(
  /\/$/,
  "",
);

// Ketcher's standalone mode supports one working editor per page. The first
// mounted editor is active; any others show a notice until it is removed.
const mountedEditors = new Map<ParentElementType, IMountedEditor>();

const toWidgetProps = (editor: IMountedEditor): IKetcherWidgetProps => ({
  molecule: editor.data.molecule,
  height: editor.data.height,
  moleculeFormat: editor.data.molecule_format,
  macromolecules: editor.data.macromolecules,
  isLiveUpdate: editor.data.live_update,
  staticResourcesUrl: STATIC_RESOURCES_URL,
  onMoleculeChange: editor.onMoleculeChange,
});

const renderMountedEditors = (): void => {
  let isActiveEditor = true;
  for (const editor of mountedEditors.values()) {
    editor.root.render(
      <StrictMode>
        {isActiveEditor ? (
          <KetcherWidget {...toWidgetProps(editor)} />
        ) : (
          <SingleEditorNotice />
        )}
      </StrictMode>,
    );
    isActiveEditor = false;
  }
};

const createMountedEditor = (
  parentElement: ParentElementType,
  data: IKetcherComponentData,
  setStateValue: SetStateValueType,
): IMountedEditor => {
  const container = document.createElement("div");
  parentElement.appendChild(container);
  if (mountedEditors.size > 0) {
    console.error("[MULTIPLE_EDITORS] Only one Ketcher editor per page");
  }
  const editor: IMountedEditor = {
    root: createRoot(container),
    data,
    setStateValue,
    onMoleculeChange: (serializedMolecule) =>
      editor.setStateValue("molecule", serializedMolecule),
  };
  return editor;
};

// Streamlit calls this on mount and again on every rerun with new data, so each
// editor keeps its React root and Ketcher instance (and drawing) alive.
const renderKetcherComponent: KetcherRendererType = ({
  data,
  parentElement,
  setStateValue,
}) => {
  const mountedEditor = mountedEditors.get(parentElement);
  if (mountedEditor) {
    mountedEditor.data = data;
    mountedEditor.setStateValue = setStateValue;
  } else {
    mountedEditors.set(
      parentElement,
      createMountedEditor(parentElement, data, setStateValue),
    );
  }
  renderMountedEditors();
  return () => {
    mountedEditors.get(parentElement)?.root.unmount();
    mountedEditors.delete(parentElement);
    renderMountedEditors();
  };
};

export default renderKetcherComponent;
