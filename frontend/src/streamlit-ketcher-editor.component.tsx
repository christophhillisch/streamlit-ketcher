import { ComponentProps } from "react";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { Editor as KetcherEditor } from "ketcher-react";
import styled from "@emotion/styled";
import { Ketcher } from "ketcher-core";

type KetcherEditorPropsType = ComponentProps<typeof KetcherEditor>;

interface KetcherEditorWrapperProps {
  height: number;
}

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
  ...rest
}: StreamlitKetcherEditorProps) => (
  <KetcherEditorWrapper height={height}>
    <KetcherEditor structServiceProvider={structServiceProvider} {...rest} />
  </KetcherEditorWrapper>
);

export default StreamlitKetcherEditor;
