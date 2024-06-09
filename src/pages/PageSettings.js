import '../style/page-settings.scss';
import {Stack, Title} from "@mantine/core";
import {useAccount} from "../util/react";
import {t} from "../util/i18n";
import React from "react";
import {AccountSettingsForm} from "../forms/AccountSettingsForm";

export function PageSettings() {
  const {account, updateAccount} = useAccount();

  return <Stack className="page-settings">
    <Title order={1}>{t("Settings")}</Title>

    <AccountSettingsForm
      settings={account.settings}
      setSettings={(settings) => updateAccount({settings})}
      loadSettings={res => updateAccount(res)}
    />
  </Stack>;
}
