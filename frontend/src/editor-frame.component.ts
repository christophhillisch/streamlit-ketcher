import styled from "@emotion/styled";
import { BASE_RADIUS, BORDER_COLOR } from "./streamlit-theme";

const BORDER_WIDTH = "1px";

// Ketcher has no dark theme, so its light UI sits in a visible frame that
// makes the contrast with a dark Streamlit page look deliberate.
export const EditorFrame = styled.div({
  position: "relative",
  overflow: "hidden",
  borderWidth: BORDER_WIDTH,
  borderStyle: "solid",
  borderColor: BORDER_COLOR,
  borderRadius: BASE_RADIUS,
});
