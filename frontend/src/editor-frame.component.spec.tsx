import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { EditorFrame } from "./editor-frame.component";
import { darkTheme } from "./mocks";

describe("EditorFrame", () => {
  it("should draw a border in the theme's faded text color", () => {
    const wrapper = render(<EditorFrame theme={darkTheme} />);

    expect(wrapper.container.children[0]).toHaveStyle({
      border: `1px solid ${darkTheme.fadedText20}`,
    });
  });
});
