import React, {useMemo} from "react";
import {createSecret} from "../util/entities";
import {Modal} from "@mantine/core";
import {t} from "../util/i18n";
import {SecretSettingsForm} from "../forms/SecretSettingsForm";
import {getAndIncrementId} from "../util/storage";
import {useAccount} from "../util/react";

/**
 * @param open
 * @param onClose
 * @param onSubmit
 * @returns {JSX.Element}
 * @constructor
 */
export function NewSecretModal({open, onClose, onSubmit}) {
  const {updateAccount, account} = useAccount();
  const secret = useMemo(() => createSecret(), [account]);

  return <Modal
    opened={open}
    onClose={onClose}
    title={t("New Secret")}
    zIndex={5000}
    centered
  >
    <SecretSettingsForm
      key="form"
      secret={secret}
      save={newSecret => {
        // Advance the next secret index
        getAndIncrementId('secret-index');
        if (onSubmit) {
          onSubmit(newSecret);
        }
        updateAccount({secrets: [newSecret, ...account.secrets]});
        onClose();
      }}
      discard={onClose}
    />
  </Modal>;
}
