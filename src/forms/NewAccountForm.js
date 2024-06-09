import React, {useState} from "react";
import {Button, Modal, Stack, TextInput} from "@mantine/core";
import {MasterPasswordInput} from "../components/MasterPasswordInput";
import {t} from "../util/i18n";
import {notifications} from "@mantine/notifications";
import {createAccount} from "../util/entities";

/**
 * Single field asking for the master password.
 *
 * @param submit
 * @returns {JSX.Element}
 * @constructor
 */
export function NewAccountForm({submit}) {
  const [name, setName] = useState(t("Main account"));
  const [masterPassword, setMasterPassword] = useState("");

  return <Stack className="master-password-form">

    <MasterPasswordInput value={masterPassword} onChange={setMasterPassword}/>

    <TextInput
      label={t("Account name")}
      placeholder={t("My new account")}
      value={name}
      onChange={e => setName(e.target.value)}
      mt="md"
    />

    <Button
      onClick={() => submit(createAccount(masterPassword, name))}
      disabled={masterPassword === '' || name === ''}
      mt="md"
    >
      {t("Create account")}
    </Button>
  </Stack>
}

export function NewAccountModal({open, setOpen, addAccount}) {
  return <Modal
    opened={open}
    onClose={() => setOpen(false)}
    title={t("New account")}
    zIndex={5000}
    centered
  >
    <NewAccountForm submit={newAccount => {
      setOpen(false);
      addAccount(newAccount);
      notifications.show({
        title: t("New Account"),
        message: t("Account added successfully"),
        color: 'green',
      });
    }}/>
  </Modal>;
}

