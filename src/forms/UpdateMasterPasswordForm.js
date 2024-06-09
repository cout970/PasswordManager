import {useAccount} from "../util/react";
import React, {useState} from "react";
import {Button, Flex, Stack, Text, Title} from "@mantine/core";
import {t} from "../util/i18n";
import {MasterPasswordInput} from "../components/MasterPasswordInput";

/**
 * Form to change the account master password
 *
 * @returns {JSX.Element}
 * @constructor
 */
export function UpdateMasterPasswordForm() {
  const {account, updateAccount} = useAccount();
  const [value, setValue] = useState(account.masterPassword);

  return <Stack w="100%" spacing={0}>
    <Title order={3}>{t("Master password")}</Title>

    <Flex className="update-master-password" gap="md" align="end">
      <MasterPasswordInput
        value={value}
        onChange={setValue}
      />

      <Button
        color="red"
        disabled={value === '' || value === account.masterPassword}
        onClick={() => updateAccount({masterPassword: value})}
      >
        {t("Update")}
      </Button>

    </Flex>

    <Text hidden={value === account.masterPassword} color="red" mt="sm">
      {t("Warning: Changing the master password will invalidate all passwords generated with the old master password")}
    </Text>
  </Stack>;
}
