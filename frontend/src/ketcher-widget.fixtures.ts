import type {
  IKetcherWidgetArgs,
  IKetcherWidgetProps,
} from "./ketcher-widget.component";
import { darkTheme } from "./mocks";
import { vi } from "vitest";

export const setMoleculeMock = vi.fn();

export function getArgs(
  args: Partial<IKetcherWidgetArgs> = {},
): IKetcherWidgetArgs {
  return {
    molecule_format: "SMILES",
    height: 500,
    molecule: "CCO",
    macromolecules: false,
    initial_mode: "molecules",
    live_update: false,
    ...args,
  };
}

export function getProps(
  props: Partial<IKetcherWidgetProps> = {},
): IKetcherWidgetProps {
  return {
    args: getArgs(),
    disabled: true,
    width: 500,
    theme: darkTheme,
    ...props,
  };
}
