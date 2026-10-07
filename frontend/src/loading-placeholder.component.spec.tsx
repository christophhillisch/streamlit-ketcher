import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  EmptySpace,
  LoadingPlaceholder,
} from "./loading-placeholder.component";
import { BACKGROUND_COLOR, TEXT_COLOR } from "./streamlit-theme";

const HEIGHT = 420;

describe("LoadingPlaceholder", () => {
  it("should render component", () => {
    const wrapper = render(<LoadingPlaceholder height={HEIGHT} />);
    const styles = window.getComputedStyle(wrapper.container.children[0]);
    expect(styles.height).toBe(`${HEIGHT}px`);
  });

  it("should follow Streamlit's theme colors", () => {
    const wrapper = render(<LoadingPlaceholder height={HEIGHT} />);

    expect(wrapper.container.children[0]).toHaveStyle({
      backgroundColor: BACKGROUND_COLOR,
      color: TEXT_COLOR,
    });
  });
});

describe("EmptySpace", () => {
  it("should render component", () => {
    const wrapper = render(<EmptySpace height={HEIGHT} />);
    const styles = window.getComputedStyle(wrapper.container.children[0]);
    expect(styles.height).toBe(`${HEIGHT}px`);
  });
});
