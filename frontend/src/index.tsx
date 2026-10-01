import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import type {
  FrontendRenderer,
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
}

export interface IKetcherComponentState extends FrontendState {
  molecule: string | null;
}

type ParentElementType = HTMLElement | ShadowRoot;

interface IMountedEditor {
  readonly root: Root;
  props: IKetcherWidgetProps;
}

// Ketcher loads "<url>/templates/..."; this module is served from asset_dir.
const STATIC_RESOURCES_URL = new URL(".", import.meta.url).href.replace(
  /\/$/,
  "",
);

// Ketcher's standalone mode supports one working editor per page. The first
// mounted editor is active; any others show a notice until it is removed.
const mountedEditors = new Map<ParentElementType, IMountedEditor>();

const renderMountedEditors = (): void => {
  let isActiveEditor = true;
  for (const { root, props } of mountedEditors.values()) {
    root.render(
      <StrictMode>
        {isActiveEditor ? <KetcherWidget {...props} /> : <SingleEditorNotice />}
      </StrictMode>,
    );
    isActiveEditor = false;
  }
};

const createMountedEditor = (
  parentElement: ParentElementType,
  props: IKetcherWidgetProps,
): IMountedEditor => {
  const container = document.createElement("div");
  parentElement.appendChild(container);
  if (mountedEditors.size > 0) {
    console.error("[MULTIPLE_EDITORS] Only one Ketcher editor per page");
  }
  return { root: createRoot(container), props };
};

// Streamlit calls this on mount and again on every rerun with new data, so each
// editor keeps its React root and Ketcher instance (and drawing) alive.
const renderKetcherComponent: FrontendRenderer<
  IKetcherComponentState,
  IKetcherComponentData
> = ({ data, parentElement, setStateValue }) => {
  const props: IKetcherWidgetProps = {
    molecule: data.molecule,
    height: data.height,
    moleculeFormat: data.molecule_format,
    macromolecules: data.macromolecules,
    staticResourcesUrl: STATIC_RESOURCES_URL,
    onApply: (serializedMolecule) =>
      setStateValue("molecule", serializedMolecule),
  };
  const mountedEditor = mountedEditors.get(parentElement);
  if (mountedEditor) {
    mountedEditor.props = props;
  } else {
    mountedEditors.set(
      parentElement,
      createMountedEditor(parentElement, props),
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
