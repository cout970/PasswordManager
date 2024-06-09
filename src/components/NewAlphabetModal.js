import {useAccount} from "../util/react";
import React, {useMemo} from "react";
import {createAlphabet} from "../util/entities";
import {Modal} from "@mantine/core";
import {t} from "../util/i18n";
import {getAndIncrementId} from "../util/storage";
import {AlphabetSettingsForm} from "../forms/AlphabetSettingsForm";

/**
 * @param open
 * @param onClose
 * @param onSubmit
 * @returns {JSX.Element}
 * @constructor
 */
export function NewAlphabetModal({open, onClose, onSubmit}) {
  const {updateAccount, account} = useAccount();
  /** @type {Alphabet} */
  const alphabet = useMemo(() => createAlphabet(), [account]);

  return <Modal
    opened={open}
    onClose={onClose}
    title={t("New Alphabet")}
    zIndex={5000}
    centered
  >
    <AlphabetSettingsForm
      key="form"
      alphabet={alphabet}
      save={newAlphabet => {
        // Advance the next alphabet index
        getAndIncrementId('alphabet-index');
        if (onSubmit) {
          onSubmit(newAlphabet);
        }
        updateAccount({alphabets: [newAlphabet, ...account.alphabets]});
        onClose();
      }}
      discard={onClose}
    />
  </Modal>;
}
