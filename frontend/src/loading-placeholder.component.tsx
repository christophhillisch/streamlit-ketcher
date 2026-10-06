import styled from "@emotion/styled";
import { FixedTheme } from "./theme";

interface LoadingPlaceholderProps {
  height: number;
  theme: FixedTheme;
}

interface EmptySpaceProps {
  height: number;
}

export const LoadingPlaceholder = styled.div<LoadingPlaceholderProps>(
  ({ height, theme }) => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: `${height}px`,
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    position: "absolute",
    width: "100%",
    zIndex: 1,
  }),
);

export const EmptySpace = styled.div<EmptySpaceProps>(({ height }) => ({
  height: `${height}px`,
  width: "100%",
}));
