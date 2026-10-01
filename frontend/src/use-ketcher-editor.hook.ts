import { useCallback, useEffect, useState } from "react";
import { Ketcher } from "ketcher-core";

export const FORMAT_SMILES = "SMILES";
export const FORMAT_MOLFILE = "MOLFILE";

export type MoleculeFormatType = typeof FORMAT_SMILES | typeof FORMAT_MOLFILE;

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

const serializeMolecule = (
  ketcher: Ketcher,
  moleculeFormat: MoleculeFormatType,
): Promise<string> =>
  moleculeFormat === FORMAT_SMILES ? ketcher.getSmiles() : ketcher.getMolfile();

export const useKetcherEditor = (
  molecule: string | null,
  moleculeFormat: MoleculeFormatType,
  onApply: (serializedMolecule: string) => void,
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
      onApply(serializedMolecule);
    } catch (error) {
      logError("SERIALIZE_FAILED", error);
    }
  }, [ketcher, moleculeFormat, onApply]);

  return { isReady: ketcher !== null, handleInit, handleReset, handleApply };
};
