import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  EmptySpace,
  LoadingPlaceholder,
} from "./loading-placeholder.component";
import { darkTheme, lightTheme } from "./mocks";

describe("LoadingPlaceholder", () => {
  it("should render component", () => {
    const wrapper = render(
      <LoadingPlaceholder height={420} theme={darkTheme} />,
    );
    const el = wrapper.container.children[0];
    const styles = window.getComputedStyle(el);
    expect(styles.height).toBe("420px");
  });

  it.each([
    ["dark", darkTheme],
    ["light", lightTheme],
  ])("should follow the %s theme colors", (_base, theme) => {
    const wrapper = render(<LoadingPlaceholder height={420} theme={theme} />);

    expect(wrapper.container.children[0]).toHaveStyle({
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
    });
  });
});

describe("EmptySpace", () => {
  it("should render component", () => {
    const wrapper = render(<EmptySpace height={420} />);
    const el = wrapper.container.children[0];
    const styles = window.getComputedStyle(el);
    expect(styles.height).toBe("420px");
  });
});
