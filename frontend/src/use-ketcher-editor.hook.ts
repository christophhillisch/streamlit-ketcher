import { useCallback, useEffect, useRef, useState } from "react";
import { Streamlit } from "streamlit-component-lib";
import { Ketcher } from "ketcher-core";
import { useLiveUpdate } from "./use-live-update.hook";

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
  handleReset: () => void;
  handleApply: () => void;
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

const serializeMolecule = async (
  ketcher: Ketcher,
  moleculeFormat: MoleculeFormatType,
): Promise<string | null> => {
  try {
    return await MOLECULE_SERIALIZERS[moleculeFormat](ketcher);
  } catch (error: unknown) {
    logError("SERIALIZE_FAILED", error);
    return null;
  }
};

const useMoleculeLoader = (
  ketcher: Ketcher | null,
  molecule: string | null,
  shouldSkipMolecule: (molecule: string | null) => boolean,
): void => {
  // Ketcher runs overlapping setMolecule calls concurrently and an older load
  // can win, so each load waits for the previous one.
  const previousLoadRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    // Python reruns with the value just sent; reloading it would reset the canvas.
    if (!ketcher || shouldSkipMolecule(molecule)) {
      return;
    }
    previousLoadRef.current = previousLoadRef.current
      .then(() => ketcher.setMolecule(molecule ?? ""))
      .catch((error: unknown) => logError("LOAD_MOLECULE_FAILED", error));
  }, [ketcher, molecule, shouldSkipMolecule]);
};

export const useKetcherEditor = (
  molecule: string | null,
  moleculeFormat: MoleculeFormatType,
  isLiveUpdate: boolean,
): IKetcherEditor => {
  const [ketcher, setKetcher] = useState<Ketcher | null>(null);

  const serializeCurrentMolecule = useCallback(
    async () => (ketcher ? serializeMolecule(ketcher, moleculeFormat) : null),
    [ketcher, moleculeFormat],
  );
  const { isLastSentMolecule } = useLiveUpdate(
    ketcher,
    isLiveUpdate,
    serializeCurrentMolecule,
  );
  useMoleculeLoader(ketcher, molecule, isLastSentMolecule);

  const handleReset = useCallback(() => {
    void ketcher
      ?.setMolecule("")
      .catch((error: unknown) => logError("RESET_FAILED", error));
  }, [ketcher]);

  const handleApply = useCallback(() => {
    void serializeCurrentMolecule().then((serializedMolecule) => {
      if (serializedMolecule !== null) {
        Streamlit.setComponentValue(serializedMolecule);
      }
    });
  }, [serializeCurrentMolecule]);

  return {
    isReady: ketcher !== null,
    handleInit: setKetcher,
    handleReset,
    handleApply,
  };
};
