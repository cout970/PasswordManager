import {useAccount} from "../util/react";
import {Modal} from "@mantine/core";
import {t} from "../util/i18n";
import {FolderSettingsForm} from "../forms/FolderSettingsForm";
import {removeFolder, replaceFolder} from "../util/folder";
import React from "react";
import {validateFolders} from "../util/entities";

export function FolderSettingsModal({value, open, onClose, onSubmit}) {
  const {updateAccount, account} = useAccount();

  return <Modal
    opened={open}
    onClose={onClose}
    title={t("New Secret")}
    zIndex={5000}
    centered
  >
    <FolderSettingsForm
      key="form"
      value={value}
      save={value => {
        if (onSubmit) {
          onSubmit(value);
        }
        updateAccount({folders: replaceFolder(account.folders, value)});
        onClose();
      }}
      remove={() => {
        let newFolders = removeFolder(account.folders, value);
        updateAccount(validateFolders({...account, folders: newFolders}));
        onClose();
      }}
      discard={onClose}
    />
  </Modal>;
}
