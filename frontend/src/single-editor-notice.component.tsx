import styled from "@emotion/styled";

export const SINGLE_EDITOR_MESSAGE =
  "Only one Ketcher editor can be shown per page. Remove the other st_ketcher " +
  "calls on this page, or move them to separate pages.";

const NoticeBox = styled.div({
  padding: "1rem",
  border: "1px solid var(--st-border-color, rgba(49, 51, 63, 0.2))",
  borderRadius: "var(--st-base-radius, 0.5rem)",
  color: "var(--st-text-color, #31333f)",
});

export const SingleEditorNotice = () => (
  <NoticeBox role="alert">{SINGLE_EDITOR_MESSAGE}</NoticeBox>
);
