import {
  ComponentProps,
  Streamlit,
  withStreamlitConnection,
} from "streamlit-component-lib";
import { lazy, Suspense, useEffect, useRef } from "react";
import "ketcher-react/dist/index.css";
import useResizeObserver from "@react-hook/resize-observer";
import { Button, ButtonContainer } from "./button.component";
import {
  EmptySpace,
  LoadingPlaceholder,
} from "./loading-placeholder.component";
import { FixedTheme } from "./theme";
import {
  logKetcherError,
  MoleculeFormatType,
  useKetcherEditor,
} from "./use-ketcher-editor.hook";

const StreamlitKetcherEditor = lazy(
  () => import("./streamlit-ketcher-editor.component"),
);

export interface IKetcherWidgetArgs {
  molecule: string | null;
  height: number;
  molecule_format: MoleculeFormatType;
  macromolecules: boolean;
  live_update: boolean;
}

export interface IKetcherWidgetProps extends ComponentProps {
  args: IKetcherWidgetArgs;
}

export const KetcherWidget = function (props: IKetcherWidgetProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const {
    molecule,
    molecule_format: moleculeFormat,
    height,
    macromolecules,
    live_update: isLiveUpdate,
  } = props.args;
  const theme = props.theme as FixedTheme;
  const { isReady, handleInit, handleReset, handleApply } = useKetcherEditor(
    molecule,
    moleculeFormat,
    isLiveUpdate,
  );

  useEffect(() => Streamlit.setFrameHeight());
  useResizeObserver(editorRef, () => Streamlit.setFrameHeight());

  return (
    <div ref={editorRef}>
      {!isReady && (
        <LoadingPlaceholder data-testid="loading-placeholder" height={height}>
          Loading...
        </LoadingPlaceholder>
      )}
      <Suspense fallback={<EmptySpace height={height} />}>
        <StreamlitKetcherEditor
          height={height}
          disableMacromoleculesEditor={!macromolecules}
          errorHandler={logKetcherError}
          onInit={handleInit}
        />
      </Suspense>
      <ButtonContainer>
        <Button theme={theme} onClick={handleReset} disabled={!isReady}>
          Reset
        </Button>
        {!isLiveUpdate && (
          <Button theme={theme} onClick={handleApply} disabled={!isReady}>
            Apply
          </Button>
        )}
      </ButtonContainer>
    </div>
  );
};

// "withStreamlitConnection" bootstraps the connection between the component
// and the Streamlit app, and passes arguments from Python to the component.
export default withStreamlitConnection(KetcherWidget);
