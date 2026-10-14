import type { StreamlitKetcherEditorProps } from "./streamlit-ketcher-editor.component";
import { setMoleculeMock } from "./ketcher-widget.fixtures";
import { Ketcher } from "ketcher-core";
import { useEffect, useState } from "react";

let currentMolecule: string | null = null;
let moleculeListener: ((mol: string) => void) | null = null;
let changeHandler: (() => void) | null = null;

const mockKetcher = {
  setMolecule: (mol: string) => {
    setMoleculeMock(mol);
    currentMolecule = mol;
    moleculeListener?.(mol);
    changeHandler?.();
    return Promise.resolve();
  },
  editor: {
    subscribe: (_eventName: string, handler: () => void) => {
      changeHandler = handler;
      return handler;
    },
    unsubscribe: () => {
      changeHandler = null;
    },
  },
  getSmiles: (isExtended?: boolean) =>
    (isExtended ? "CXSMILES:" : "SMILES:") + currentMolecule,
  getMolfile: () => "MOLFILE:" + currentMolecule,
  getKet: () => "KET:" + currentMolecule,
  getInchi: () => "INCHI:" + currentMolecule,
  getInChIKey: () => "INCHI_KEY:" + currentMolecule,
  getSmarts: () => "SMARTS:" + currentMolecule,
  getRxn: () => "RXN:" + currentMolecule,
};

// Stands in for the lazy-loaded editor module: vi.mock(path, () => import(...)).
const MockStreamlitKetcherEditor = (props: StreamlitKetcherEditorProps) => {
  const { onInit } = props;
  const [, setMolecule] = useState<string>();
  useEffect(() => {
    moleculeListener = setMolecule;
    const timer = setTimeout(
      () => onInit!(mockKetcher as unknown as Ketcher),
      0,
    );

    return () => clearTimeout(timer);
  }, [onInit]);

  return (
    <div>
      StreamlitKetcherEditor [{"molecule=" + JSON.stringify(currentMolecule)}
      {" disableMacromoleculesEditor=" +
        String(props.disableMacromoleculesEditor)}
      {" initialMode=" + props.initialMode}]
    </div>
  );
};

export default MockStreamlitKetcherEditor;
