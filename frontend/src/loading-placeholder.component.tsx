import styled from "@emotion/styled";
import { BACKGROUND_COLOR, TEXT_COLOR } from "./streamlit-theme";

interface IHeightProps {
  height: number;
}

export const LoadingPlaceholder = styled.div<IHeightProps>(({ height }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: `${height}px`,
  backgroundColor: BACKGROUND_COLOR,
  color: TEXT_COLOR,
  position: "absolute",
  width: "100%",
  zIndex: 1,
}));

export const EmptySpace = styled.div<IHeightProps>(({ height }) => ({
  height: `${height}px`,
  width: "100%",
}));
