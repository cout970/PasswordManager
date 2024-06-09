import {useAccount} from "../util/react";
import {Modal} from "@mantine/core";
import React from "react";
import {t} from "../util/i18n";
import {AlphabetSettingsForm} from "../forms/AlphabetSettingsForm";

/**
 * @param value {Alphabet}
 * @param open {boolean}
 * @param onClose {()=>void}
 * @param onSubmit {(Alphabet)=>void}
 * @returns {JSX.Element}
 * @constructor
 */
export function AlphabetSettingsModal({value, open, onClose, onSubmit}) {
  const {account, updateAccount} = useAccount();

  return <Modal
    opened={open}
    onClose={onClose}
    title={t("Alphabet settings")}
    zIndex={5000}
    centered
  >
    <AlphabetSettingsForm
      key="form"
      alphabet={value}
      save={newValue => {
        if (onSubmit) {
          onSubmit(newValue);
        }
        updateAccount({alphabets: account.alphabets.map(s => s.id === newValue.id ? newValue : s)});
        onClose();
      }}
      remove={() => {
        updateAccount({alphabets: account.alphabets.filter(s => s.id !== value.id)});
        onClose();
      }}
      discard={onClose}
    />
  </Modal>;
}
