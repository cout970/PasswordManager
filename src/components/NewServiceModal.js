import {useAccount} from "../util/react";
import React, {useMemo} from "react";
import {createService} from "../util/entities";
import {Modal} from "@mantine/core";
import {ServiceSettingsForm} from "../forms/ServiceSettingsForm";
import {getAndIncrementId} from "../util/storage";
import {t} from "../util/i18n";

/**
 * Modal for creating a new service
 *
 * @param open {boolean}
 * @param onClose {()=>void}
 * @param onSubmit {(Secret)=>void}
 * @returns {JSX.Element}
 * @constructor
 */
export function NewServiceModal({open, onClose, onSubmit}) {
  const {account, updateAccount} = useAccount();
  const service = useMemo(() => createService(account.settings), [account]);

  return <Modal
    opened={open}
    onClose={onClose}
    title={t('New Service')}
    zIndex={5000}
    centered
  >
    <ServiceSettingsForm
      key="form"
      service={service}
      save={newService => {
        // Advance the next service index
        getAndIncrementId('service-index');
        if (onSubmit) {
          onSubmit(newService);
        }
        updateAccount({services: [newService, ...account.services]});
        onClose();
      }}
      discard={onClose}
    />
  </Modal>;
}
