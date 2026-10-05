import { ComponentProps } from "react";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { Editor as KetcherEditor } from "ketcher-react";
import styled from "@emotion/styled";
import { Ketcher } from "ketcher-core";

// Ketcher loads "<url>/templates/..." relative to the component's index.html.
const STATIC_RESOURCES_URL = ".";

type KetcherEditorPropsType = ComponentProps<typeof KetcherEditor>;

interface KetcherEditorWrapperProps {
  height: number;
}

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
  ...rest
}: StreamlitKetcherEditorProps) => (
  <KetcherEditorWrapper height={height}>
    <KetcherEditor
      staticResourcesUrl={STATIC_RESOURCES_URL}
      structServiceProvider={structServiceProvider}
      {...rest}
    />
  </KetcherEditorWrapper>
);

export default StreamlitKetcherEditor;
