import { lazy, Suspense } from "react";
import "ketcher-react/dist/index.css";
import { Button, ButtonContainer } from "./button.component";
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
  readonly staticResourcesUrl: string;
  readonly onApply: (serializedMolecule: string) => void;
}

export const KetcherWidget = ({
  molecule,
  height,
  moleculeFormat,
  staticResourcesUrl,
  onApply,
}: IKetcherWidgetProps) => {
  const { isReady, handleInit, handleReset, handleApply } = useKetcherEditor(
    molecule,
    moleculeFormat,
    onApply,
  );

  return (
    <div data-testid="streamlit-ketcher">
      {!isReady && (
        <LoadingPlaceholder data-testid="loading-placeholder" height={height}>
          Loading...
        </LoadingPlaceholder>
      )}
      <Suspense fallback={<EmptySpace height={height} />}>
        <StreamlitKetcherEditor
          height={height}
          staticResourcesUrl={staticResourcesUrl}
          errorHandler={logKetcherError}
          onInit={handleInit}
        />
      </Suspense>
      <ButtonContainer>
        <Button onClick={handleReset} disabled={!isReady}>
          Reset
        </Button>
        <Button onClick={handleApply} disabled={!isReady}>
          Apply
        </Button>
      </ButtonContainer>
    </div>
  );
};
