import { ComponentProps } from "react";
// Loads the Indigo engine as a separate, cacheable .wasm file instead of base64.
import { StandaloneStructServiceProvider } from "ketcher-standalone/dist/binaryWasm";
import { Editor as KetcherEditor } from "ketcher-react";
import styled from "@emotion/styled";
import { Ketcher, ketcherProvider } from "ketcher-core";

// Ketcher loads "<url>/templates/..." relative to the component's index.html.
const STATIC_RESOURCES_URL = ".";

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

const structServiceProvider = new StandaloneStructServiceProvider();

export interface StreamlitKetcherEditorProps extends Omit<
  KetcherEditorPropsType,
  "staticResourcesUrl" | "structServiceProvider"
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
        staticResourcesUrl={STATIC_RESOURCES_URL}
        structServiceProvider={structServiceProvider}
        onInit={handleInit}
        {...rest}
      />
    </KetcherEditorWrapper>
  );
};

export default StreamlitKetcherEditor;
