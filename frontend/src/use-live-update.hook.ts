import { useCallback, useEffect, useRef } from "react";
import { Streamlit } from "streamlit-component-lib";
import { Ketcher } from "ketcher-core";

// Every value sent to Streamlit triggers a full rerun of the Python script.
export const LIVE_UPDATE_DEBOUNCE_MS = 300;

const CHANGE_EVENT = "change";

interface ILiveUpdate {
  isLastSentMolecule: (molecule: string | null) => boolean;
}

// Template tools add a ghost copy of the template under the cursor as real
// atoms flagged `isPreview`, and every Ketcher export includes them.
const hasTemplatePreview = (ketcher: Ketcher): boolean => {
  const { atoms, bonds } = ketcher.editor.struct();
  return [...atoms.values(), ...bonds.values()].some(
    (structureItem) => structureItem.isPreview,
  );
};

const useDebouncedChangeListener = (
  ketcher: Ketcher | null,
  isEnabled: boolean,
  onDebouncedChange: () => Promise<void>,
): void => {
  useEffect(() => {
    if (!ketcher || !isEnabled) {
      return;
    }
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    // Showing or hiding the preview emits no change event, so poll until it is gone.
    const sendWithoutPreview = (): void => {
      if (hasTemplatePreview(ketcher)) {
        scheduleSend();
        return;
      }
      void onDebouncedChange();
    };
    const scheduleSend = (): void => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(sendWithoutPreview, LIVE_UPDATE_DEBOUNCE_MS);
    };
    const subscriber: unknown = ketcher.editor.subscribe(
      CHANGE_EVENT,
      scheduleSend,
    );

    return () => {
      clearTimeout(debounceTimer);
      ketcher.editor.unsubscribe(CHANGE_EVENT, subscriber);
    };
  }, [ketcher, isEnabled, onDebouncedChange]);
};

export const useLiveUpdate = (
  ketcher: Ketcher | null,
  isEnabled: boolean,
  serializeCurrentMolecule: () => Promise<string | null>,
): ILiveUpdate => {
  const lastSentMoleculeRef = useRef<string | null>(null);

  const sendChangedMolecule = useCallback(async () => {
    const serializedMolecule = await serializeCurrentMolecule();
    const hasChanged =
      serializedMolecule !== null &&
      serializedMolecule !== lastSentMoleculeRef.current;
    if (hasChanged) {
      lastSentMoleculeRef.current = serializedMolecule;
      Streamlit.setComponentValue(serializedMolecule);
    }
  }, [serializeCurrentMolecule]);

  useDebouncedChangeListener(ketcher, isEnabled, sendChangedMolecule);

  const isLastSentMolecule = useCallback(
    (molecule: string | null) =>
      isEnabled && molecule === lastSentMoleculeRef.current,
    [isEnabled],
  );

  return { isLastSentMolecule };
};
