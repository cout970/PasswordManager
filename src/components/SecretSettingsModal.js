import {useAccount} from "../util/react";
import {Modal} from "@mantine/core";
import {SecretSettingsForm} from "../forms/SecretSettingsForm";
import React from "react";

/**
 * @param value {Secret}
 * @param open {boolean}
 * @param onClose {()=>void}
 * @param onSubmit {(Secret)=>void}
 * @returns {JSX.Element}
 * @constructor
 */
export function SecretSettingsModal({value, open, onClose, onSubmit}) {
  const {account, updateAccount} = useAccount();

  return <Modal
    opened={open}
    onClose={onClose}
    title="Secret settings"
    zIndex={5000}
    centered
  >
    <SecretSettingsForm
      key="form"
      secret={value}
      save={newValue => {
        if (onSubmit) {
          onSubmit(newValue);
        }
        updateAccount({secrets: account.secrets.map(s => s.id === newValue.id ? newValue : s)});
        onClose();
      }}
      remove={() => {
        updateAccount({secrets: account.secrets.filter(s => s.id !== value.id)});
        onClose();
      }}
      discard={onClose}
    />
  </Modal>;
}
