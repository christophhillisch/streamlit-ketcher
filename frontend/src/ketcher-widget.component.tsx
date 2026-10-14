import { lazy, Suspense } from "react";
import "ketcher-react/dist/index.css";
import { Button, ButtonContainer } from "./button.component";
import { EditorFrame } from "./editor-frame.component";
import {
  EmptySpace,
  LoadingPlaceholder,
} from "./loading-placeholder.component";
import {
  logKetcherError,
  MoleculeFormatType,
  useKetcherEditor,
} from "./use-ketcher-editor.hook";

const StreamlitKetcherEditor = lazy(
  () => import("./streamlit-ketcher-editor.component"),
);

export interface IKetcherWidgetProps {
  readonly molecule: string | null;
  readonly height: number;
  readonly moleculeFormat: MoleculeFormatType;
  readonly macromolecules: boolean;
  readonly isLiveUpdate: boolean;
  readonly staticResourcesUrl: string;
  readonly onMoleculeChange: (serializedMolecule: string) => void;
}

export const KetcherWidget = ({
  molecule,
  height,
  moleculeFormat,
  macromolecules,
  isLiveUpdate,
  staticResourcesUrl,
  onMoleculeChange,
}: IKetcherWidgetProps) => {
  const { isReady, handleInit, handleReset, handleApply } = useKetcherEditor(
    molecule,
    moleculeFormat,
    isLiveUpdate,
    onMoleculeChange,
  );

  return (
    <div data-testid="streamlit-ketcher">
      <EditorFrame data-testid="editor-frame">
        {!isReady && (
          <LoadingPlaceholder data-testid="loading-placeholder" height={height}>
            Loading...
          </LoadingPlaceholder>
        )}
        <Suspense fallback={<EmptySpace height={height} />}>
          <StreamlitKetcherEditor
            height={height}
            disableMacromoleculesEditor={!macromolecules}
            staticResourcesUrl={staticResourcesUrl}
            errorHandler={logKetcherError}
            onInit={handleInit}
          />
        </Suspense>
      </EditorFrame>
      <ButtonContainer>
        <Button onClick={handleReset} disabled={!isReady}>
          Reset
        </Button>
        {!isLiveUpdate && (
          <Button onClick={handleApply} disabled={!isReady}>
            Apply
          </Button>
        )}
      </ButtonContainer>
    </div>
  );
};
