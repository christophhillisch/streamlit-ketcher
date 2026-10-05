import { useCallback, useEffect, useState } from "react";
import { Streamlit } from "streamlit-component-lib";
import { Ketcher } from "ketcher-core";

export const FORMAT_SMILES = "SMILES";
export const FORMAT_MOLFILE = "MOLFILE";
export const FORMAT_KET = "KET";
export const FORMAT_CXSMILES = "CXSMILES";
export const FORMAT_INCHI = "INCHI";
export const FORMAT_INCHI_KEY = "INCHI_KEY";
export const FORMAT_SMARTS = "SMARTS";
export const FORMAT_RXN = "RXN";

export type MoleculeFormatType =
  | typeof FORMAT_SMILES
  | typeof FORMAT_MOLFILE
  | typeof FORMAT_KET
  | typeof FORMAT_CXSMILES
  | typeof FORMAT_INCHI
  | typeof FORMAT_INCHI_KEY
  | typeof FORMAT_SMARTS
  | typeof FORMAT_RXN;

interface IKetcherEditor {
  isReady: boolean;
  handleInit: (ketcher: Ketcher) => void;
  handleReset: () => Promise<void>;
  handleApply: () => Promise<void>;
}

export const logKetcherError = (message: string): void =>
  console.error("[KETCHER_ERROR]", message);

const logError = (errorCode: string, error: unknown): void =>
  console.error(`[${errorCode}]`, error);

const IS_EXTENDED_SMILES = true;

const MOLECULE_SERIALIZERS: Record<
  MoleculeFormatType,
  (ketcher: Ketcher) => Promise<string>
> = {
  [FORMAT_SMILES]: (ketcher) => ketcher.getSmiles(),
  [FORMAT_MOLFILE]: (ketcher) => ketcher.getMolfile(),
  [FORMAT_KET]: (ketcher) => ketcher.getKet(),
  [FORMAT_CXSMILES]: (ketcher) => ketcher.getSmiles(IS_EXTENDED_SMILES),
  [FORMAT_INCHI]: (ketcher) => ketcher.getInchi(),
  [FORMAT_INCHI_KEY]: (ketcher) => ketcher.getInChIKey(),
  [FORMAT_SMARTS]: (ketcher) => ketcher.getSmarts(),
  [FORMAT_RXN]: (ketcher) => ketcher.getRxn(),
};

const serializeMolecule = (
  ketcher: Ketcher,
  moleculeFormat: MoleculeFormatType,
): Promise<string> => MOLECULE_SERIALIZERS[moleculeFormat](ketcher);

export const useKetcherEditor = (
  molecule: string | null,
  moleculeFormat: MoleculeFormatType,
): IKetcherEditor => {
  const [ketcher, setKetcher] = useState<Ketcher | null>(null);

  useEffect(() => {
    if (!ketcher) {
      return;
    }
    ketcher
      .setMolecule(molecule ?? "")
      .catch((error: unknown) => logError("LOAD_MOLECULE_FAILED", error));
  }, [ketcher, molecule]);

  const handleInit = useCallback(
    (initializedKetcher: Ketcher) => setKetcher(initializedKetcher),
    [],
  );

  const handleReset = useCallback(async () => {
    try {
      await ketcher?.setMolecule("");
    } catch (error) {
      logError("RESET_FAILED", error);
    }
  }, [ketcher]);

  const handleApply = useCallback(async () => {
    if (!ketcher) {
      return;
    }
    try {
      const serializedMolecule = await serializeMolecule(
        ketcher,
        moleculeFormat,
      );
      Streamlit.setComponentValue(serializedMolecule);
    } catch (error) {
      logError("SERIALIZE_FAILED", error);
    }
  }, [ketcher, moleculeFormat]);

  return { isReady: ketcher !== null, handleInit, handleReset, handleApply };
};
