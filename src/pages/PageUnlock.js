import {Button, Modal, Select, Stack, Text} from "@mantine/core";
import {t} from "../util/i18n";
import {useMemo, useState} from "react";
import {MasterPasswordInput} from "../components/MasterPasswordInput";
import {IconLockOpen} from "@tabler/icons-react";
import {useAccount, usePage} from "../util/react";
import {useDebouncedValue} from "@mantine/hooks";
import {verifyMasterPasswordHash} from "../util/export";

export function PageUnlock() {
  const {account, updateAccount, switchAccount, accountManager} = useAccount();
  const {gotoPage} = usePage();
  const [masterPassword, setMasterPassword] = useState('');
  const [debouncedMasterPassword] = useDebouncedValue(masterPassword, 500);

  const accountSelector = accountManager.getAllAccounts().map(account => ({
    value: account.id,
    label: t("Account: {name}", {name: account.settings.accountName ?? 'Default account'})
  }));

  const unlock = () => {
    if (masterPassword !== '' && (verifyMasterPasswordHash(masterPassword, account.masterPasswordHash) || !!window.disableMasterPasswordCheck)) {
      updateAccount({masterPassword});
      gotoPage('home');
    }
  }

  const valid = useMemo(() => {
    return debouncedMasterPassword !== '' && (verifyMasterPasswordHash(debouncedMasterPassword, account.masterPasswordHash) || !!window.disableMasterPasswordCheck)
  }, [account, debouncedMasterPassword]);

  return <Stack>
    <Modal
      title={<Text size={38}>{t("Unlock account")}</Text>}
      opened={true}
      withCloseButton={false}
      centered
      onClose={() => undefined}
    >
      <MasterPasswordInput
        value={masterPassword}
        onChange={setMasterPassword}
        onEnter={unlock}
        trapFocus={true}
      />

      <Select
        mt="md"
        data={accountSelector}
        value={account.id}
        onChange={id => switchAccount({id})}
      />

      <Text hidden={debouncedMasterPassword === '' || valid} color="red">
        {t("Master password does not match with this account")}
      </Text>

      <Button
        fullWidth={true}
        leftIcon={<IconLockOpen size={16}/>}
        disabled={!valid}
        onClick={unlock}
        mt="md"
      >
        {t("Unlock account")}
      </Button>
    </Modal>
  </Stack>
}
