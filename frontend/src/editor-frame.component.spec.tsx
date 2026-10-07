import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { EditorFrame } from "./editor-frame.component";
import { BORDER_COLOR } from "./streamlit-theme";

// jsdom cannot resolve var() in border colors, so read the emitted CSS rule.
const getEmittedCss = (): string =>
  [...document.querySelectorAll("style")]
    .map((styleTag) => styleTag.textContent)
    .join("\n");

describe("EditorFrame", () => {
  it("should draw a solid border in Streamlit's border color", () => {
    render(<EditorFrame />);

    expect(getEmittedCss()).toContain("border-style:solid");
    expect(getEmittedCss()).toContain(`border-color:${BORDER_COLOR}`);
  });
});
