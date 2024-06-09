import React, {useMemo, useState} from "react";
import {nukeAllData} from "../util/storage";
import {Button, Checkbox, Flex, NumberInput, PasswordInput, Select, Stack, Text, TextInput} from "@mantine/core";
import {t} from "../util/i18n";
import QRCode from "react-qr-code";
import {loadExternalSettings} from "../util/export";
import {UpdateMasterPasswordForm} from "./UpdateMasterPasswordForm";
import {useAccount} from "../util/react";

export function AccountSettingsForm({settings, setSettings, loadSettings}) {
  const {account} = useAccount();
  const [showQr, setShowQr] = useState(false);

  const alphabetSelect = useMemo(() => {
    return account.alphabets.map(a => {
      return {label: a.name + ' "' + a.summary + '"', value: a.code};
    });
  }, [account]);

  const update = (changes) => {
    setSettings({...settings, ...changes});
  };

  const nuke = () => {
    if (window.confirm('Are you sure you want to permanently delete all data stored in by this app?')) {
      nukeAllData();
      window.location.reload();
    }
  };

  const url = showQr ? 'https://nss.cout970.net/?cfg=' + encodeURIComponent(JSON.stringify(settings)) : '';

  return <Stack className="settings-form" spacing={0}>
    <SettingRow key="masterPassword">
      <UpdateMasterPasswordForm/>
    </SettingRow>

    <SettingRow key="storeSettings" className="no-sep">
      <Checkbox
        label={
          <Text>
            {t("Store settings on ")}
            <a href="https://www.w3schools.com/html/html5_webstorage.asp" target="_blank" rel="noreferrer">
              {t("Local Storage")}
            </a>
          </Text>
        }
        checked={settings.storeSettings}
        onChange={e => update({storeSettings: e.target.checked})}
      />
    </SettingRow>

    <Stack key="storeSettings-open" className={settings.storeSettings ? "sub-settings" : "close"} spacing={0}>

      <SettingRow key="accountName">
        <TextInput
          label={t("Account name")}
          value={settings.accountName}
          onChange={e => update({accountName: e.currentTarget.value})}
        />
      </SettingRow>

      <SettingRow key="darkTheme">
        <Checkbox
          label={t("Dark theme")}
          checked={settings.darkTheme}
          onChange={e => update({darkTheme: e.target.checked})}
        />
      </SettingRow>

      <SettingRow key="storeMasterPassword">
        <Checkbox
          label={t("Store master password")}
          checked={settings.storeMasterPassword}
          onChange={e => update({storeMasterPassword: e.target.checked})}
        />
      </SettingRow>

      <SettingRow key="defaultPasswordLength">
        <NumberInput
          className="long-input"
          label={t("Default password length")}
          min={1} max={255}
          value={settings.defaultPasswordLength}
          onChange={value => update({defaultPasswordLength: value})}
        />
      </SettingRow>

      <SettingRow key="defaultAlphabet">
        <Select
          label={t("Default alphabet")}
          data={alphabetSelect}
          value={settings.defaultAlphabet || 'default'}
          onChange={val => update({defaultAlphabet: val})}
        />
      </SettingRow>

      <SettingRow key="defaultShowPassword">
        <Checkbox
          label={t("Default show passwords")}
          checked={settings.defaultShowPassword}
          onChange={e => update({defaultShowPassword: e.target.checked})}
        />
      </SettingRow>

      <SettingRow key="defaultAllGroups">
        <Checkbox
          label={t("Default force all characters")}
          checked={settings.defaultAllGroups}
          onChange={e => update({defaultAllGroups: e.target.checked})}
        />
      </SettingRow>

      <SettingRow key="defaultRandomSeed">
        <Checkbox
          label={t("Default use random-seed algorithm")}
          checked={settings.defaultRandomSeed}
          onChange={e => update({defaultRandomSeed: e.target.checked})}
        />
      </SettingRow>
    </Stack>

    <SettingRow key="externalServiceLoad" className="no-sep">
      <Checkbox label={t("Load settings from an external service")}
                checked={settings.externalServiceLoad}
                onChange={e => update({externalServiceLoad: e.target.checked})}
      />
    </SettingRow>

    <Stack key="externalServiceLoad-open" className={settings.externalServiceLoad ? "sub-settings" : "close"}
           spacing={0}>

      <SettingRow key="externalServiceUrl">
        <TextInput
          className="long-input"
          label={t("Settings URL")}
          value={settings.externalServiceUrl}
          onChange={e => update({externalServiceUrl: e.currentTarget.value})}
        />

        <Button
          variant="subtle"
          size="sm"
          maw={200}
          disabled={settings.externalServiceUrl === ''}
          onClick={() => loadExternalSettings(settings.externalServiceUrl, account.masterPassword, loadSettings)}
        >
          {t("Load now")}
        </Button>
      </SettingRow>
    </Stack>

    <SettingRow key="externalServiceStore" className="no-sep">
      <Checkbox label={t("Store settings on an external service")}
                checked={settings.externalServiceStore}
                onChange={e => update({externalServiceStore: e.target.checked})}
      />
    </SettingRow>

    <Stack key="externalServiceStore-open" className={settings.externalServiceStore ? "sub-settings" : "close"}
           spacing={0}>

      <SettingRow key="externalServiceHost">
        <TextInput
          className="long-input"
          label={t("Host")}
          value={settings.externalServiceHost}
          onChange={e => update({externalServiceHost: e.currentTarget.value})}
        />
      </SettingRow>

      <SettingRow key="externalServiceAccount">
        <TextInput
          className="long-input"
          label={t("Account name")}
          value={settings.externalServiceAccount}
          onChange={e => update({externalServiceAccount: e.currentTarget.value})}
        />
      </SettingRow>

      <SettingRow key="externalServicePassword">
        <PasswordInput
          className="long-input"
          label={t("Account password")}
          value={settings.externalServicePassword}
          onChange={e => update({externalServicePassword: e.currentTarget.value})}
        />
      </SettingRow>

      <SettingRow key="externalServiceRegister">
        <Checkbox
          label={t("Create account if not exists")}
          checked={settings.externalServiceRegister}
          onChange={e => update({externalServiceRegister: e.target.checked})}
        />
      </SettingRow>

      <SettingRow key="externalServiceUpdate">
        <Checkbox
          label={t("Override remote file")}
          checked={settings.externalServiceUpdate}
          onChange={e => update({externalServiceUpdate: e.target.checked})}
        />
      </SettingRow>
    </Stack>

    <Flex justify="space-between" wrap="wrap" gap="md" mt="md">
      <Button
        onClick={_ => setShowQr(!showQr)}
      >{!showQr ? t("Show settings qr") : t("Hide settings qr")}</Button>

      <Button
        variant="outline"
        color="red"
        onClick={nuke}
      >{t("Nuke all locally stored data")}</Button>

    </Flex>

    {showQr ?
      <div className="qrcode-wrapper">
        <div className="qrcode-background">
          <QRCode value={url} title={url} size={256}/>
        </div>
      </div>
      : ''}
  </Stack>;
}

function SettingRow({children, className}) {
  const classes = className ? "settings-row " + className : "settings-row";
  return <div className={classes}>
    {children}
  </div>;
}
