import {useAccount} from "../util/react";
import {Modal} from "@mantine/core";
import {t} from "../util/i18n";
import {ServiceSettingsForm} from "../forms/ServiceSettingsForm";
import React from "react";

/**
 *
 * @param value {Service}
 * @param open {boolean}
 * @param onClose {()=>void}
 * @param onSubmit {(Service)=>void}
 * @returns {JSX.Element}
 * @constructor
 */
export function ServiceSettingsModal({value, open, onClose, onSubmit}) {
  const {account, updateAccount} = useAccount();

  return <Modal
    opened={open}
    onClose={onClose}
    title={t("Service settings")}
    zIndex={5000}
    centered
  >
    <ServiceSettingsForm
      key="form"
      service={value}
      save={newValue => {
        if (onSubmit) {
          onSubmit(newValue);
        }
        updateAccount({services: account.services.map(s => s.id === newValue.id ? newValue : s)});
        onClose();
      }}
      remove={() => {
        updateAccount({services: account.services.filter(s => s.id !== value.id)});
        onClose();
      }}
      discard={onClose}
    />
  </Modal>;
}
