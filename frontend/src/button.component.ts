import styled from "@emotion/styled";
import {
  BACKGROUND_COLOR,
  BORDER_COLOR,
  BUTTON_RADIUS,
  PRIMARY_COLOR,
  TEXT_COLOR,
} from "./streamlit-theme";

const FOCUS_RING_COLOR = `color-mix(in srgb, ${PRIMARY_COLOR} 50%, transparent)`;
const DISABLED_OPACITY = 0.4;

export const Button = styled.button({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 400,
  fontFamily: "inherit",
  fontSize: "inherit",
  padding: "0.25rem 0.75rem",
  borderRadius: BUTTON_RADIUS,
  margin: 0,
  lineHeight: 1.6,
  color: TEXT_COLOR,
  width: "auto",
  userSelect: "none",
  cursor: "pointer",
  backgroundColor: BACKGROUND_COLOR,
  border: `1px solid ${BORDER_COLOR}`,
  "&:hover, &:focus-visible": {
    borderColor: PRIMARY_COLOR,
    color: PRIMARY_COLOR,
  },
  "&:focus-visible": {
    boxShadow: `0 0 0 0.2rem ${FOCUS_RING_COLOR}`,
    outline: "none",
  },
  "&:active": {
    color: BACKGROUND_COLOR,
    backgroundColor: PRIMARY_COLOR,
  },
  "&:disabled, &:disabled:hover, &:disabled:active": {
    borderColor: BORDER_COLOR,
    backgroundColor: "transparent",
    color: TEXT_COLOR,
    opacity: DISABLED_OPACITY,
    cursor: "not-allowed",
  },
});

export const ButtonContainer = styled.div({
  display: "flex",
  justifyContent: "space-between",
  padding: "1rem 0",
});
