import { ComponentProps } from "react";
// The default entry, not "ketcher-standalone/dist/binaryWasm": in Vite library
// mode that variant resolves the Indigo worker against the page URL instead of
// the component's asset_dir, so the worker never starts.
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { Editor as KetcherEditor } from "ketcher-react";
import styled from "@emotion/styled";
import { Ketcher, ketcherProvider } from "ketcher-core";

type KetcherEditorPropsType = ComponentProps<typeof KetcherEditor>;

interface KetcherEditorWrapperProps {
  height: number;
}

const UNREGISTERED_KETCHER_INDEX = -1;

const isKetcherRegistered = (ketcher: Ketcher): boolean =>
  ketcherProvider.getIndexById(ketcher.id) !== UNREGISTERED_KETCHER_INDEX;

const KetcherEditorWrapper = styled.div<KetcherEditorWrapperProps>((props) => ({
  height: `${props.height}px`,
}));

// Shared for the page lifetime: Ketcher cannot terminate the Indigo worker a
// provider starts, so one per editor would leak a worker on every remount.
const structServiceProvider = new StandaloneStructServiceProvider();

export interface StreamlitKetcherEditorProps extends Omit<
  KetcherEditorPropsType,
  "structServiceProvider"
> {
  onInit?: (ketcher: Ketcher) => void;
  height: number;
}

export const StreamlitKetcherEditor = ({
  height,
  onInit,
  ...rest
}: StreamlitKetcherEditorProps) => {
  // When StrictMode remounts the editor, ketcher-react calls onInit with its
  // first instance and unregisters that instance right afterwards. Waiting
  // for those callbacks to finish means only a live instance gets through.
  const handleInit = (ketcher: Ketcher): void => {
    setTimeout(() => {
      if (isKetcherRegistered(ketcher)) {
        onInit?.(ketcher);
      }
    });
  };

  return (
    <KetcherEditorWrapper height={height}>
      <KetcherEditor
        structServiceProvider={structServiceProvider}
        onInit={handleInit}
        {...rest}
      />
    </KetcherEditorWrapper>
  );
};

export default StreamlitKetcherEditor;
