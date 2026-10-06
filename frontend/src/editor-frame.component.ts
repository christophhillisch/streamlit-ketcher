import styled from "@emotion/styled";
import { FixedTheme } from "./theme";

// Matches Streamlit's own widget radius (theme.radii.lg).
const EDITOR_FRAME_BORDER_RADIUS = "0.5rem";

interface EditorFrameProps {
  theme: FixedTheme;
}

// Ketcher has no dark theme, so its light UI sits in a visible frame that
// makes the contrast with a dark Streamlit page look deliberate.
export const EditorFrame = styled.div<EditorFrameProps>(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  border: `1px solid ${theme.fadedText20}`,
  borderRadius: EDITOR_FRAME_BORDER_RADIUS,
}));
