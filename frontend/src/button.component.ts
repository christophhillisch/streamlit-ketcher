import styled from "@emotion/styled";

// Streamlit exposes its theme to v2 components as --st-* CSS custom properties.
const PRIMARY_COLOR = "var(--st-primary-color, #ff4b4b)";
const BACKGROUND_COLOR = "var(--st-background-color, #ffffff)";
const TEXT_COLOR = "var(--st-text-color, #31333f)";
const BORDER_COLOR = "var(--st-border-color, rgba(49, 51, 63, 0.2))";
const BUTTON_RADIUS = "var(--st-button-radius, 0.5rem)";
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
