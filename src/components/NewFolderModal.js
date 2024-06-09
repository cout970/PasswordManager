import {useAccount} from "../util/react";
import React, {useMemo} from "react";
import {createFolder} from "../util/entities";
import {Modal} from "@mantine/core";
import {t} from "../util/i18n";
import {FolderSettingsForm} from "../forms/FolderSettingsForm";
import {getAndIncrementId} from "../util/storage";

export function NewFolderModal({open, onClose, onSubmit}) {
  const {account, updateAccount} = useAccount();
  const folder = useMemo(() => createFolder(), [account]);

  return <Modal
    opened={open}
    onClose={onClose}
    title={t("New Folder")}
    zIndex={5000}
    centered
  >
    <FolderSettingsForm
      key="form"
      value={folder}
      save={s => {
        // Advance the next secret index
        getAndIncrementId('folder-index');
        if (onSubmit) {
          onSubmit(s);
        }
        updateAccount({folders: [...account.folders, s]});
        onClose();
      }}
      discard={onClose}
    />
  </Modal>;
}
