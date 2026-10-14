import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Button, ButtonContainer } from "./button.component";

describe("Button", () => {
  it("should render component", () => {
    const wrapper = render(<Button>Text</Button>);
    expect(wrapper.baseElement.textContent).toEqual("Text");
  });
});

describe("ButtonContainer", () => {
  it("should render component", () => {
    const { getAllByRole } = render(
      <ButtonContainer>
        <Button>Text 1</Button>
        <Button>Text 2</Button>
      </ButtonContainer>,
    );
    expect(getAllByRole("button").length).toEqual(2);
  });
});
