import React, {useMemo, useState} from "react";
import {useAccount} from "../util/react";
import {t} from "../util/i18n";
import {collectAllFolders, useFolderSelectorOptions} from "../util/folder";
import {getServicePassword} from "../util/util";
import {
  Button,
  Checkbox,
  Group,
  NumberInput,
  PasswordInput,
  Popover,
  Select,
  Stack,
  Text,
  TextInput
} from "@mantine/core";
import {IconAlertTriangle, IconCheck, IconTrash, IconX} from "@tabler/icons-react";
import {IconSelector} from "../components/IconSelector";

/**
 *
 * @param service {Service}
 * @param save {function(Service)}
 * @param discard {function()}
 * @param remove {function()}
 * @returns {JSX.Element}
 * @constructor
 */
export function ServiceSettingsForm({service, save, discard, remove}) {
  const [data, setData] = useState({...service});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const {account} = useAccount();

  const alphabetSelect = useMemo(() => {
    return account.alphabets.map(a => {
      return {label: a.name + ' "' + a.summary + '"', value: a.code};
    });
  }, [account]);

  const folderSelect = useFolderSelectorOptions();

  const {password, validated} = useMemo(() => {
    return getServicePassword(data, account.alphabets, account.masterPassword);
  }, [data, account]);

  return <Stack>
    <TextInput
      label={t("Name")}
      value={data.name}
      onChange={e => setData({...data, name: e.target.value})}
    />

    <TextInput
      label={t("Code")}
      value={data.code}
      onChange={e => setData({...data, code: e.target.value})}
    />

    <TextInput
      label={t("Account info")}
      placeholder={t('(Optional) Other login info: Email, Username, etc.')}
      value={data.username}
      onChange={e => setData({...data, username: e.target.value})}
    />

    <IconSelector
      value={data.icon}
      onChange={value => setData({...data, icon: value})}
    />

    {showAdvanced
      ? <>
        <NumberInput
          label={t("Password length")}
          value={data.passLen}
          min={1}
          max={255}
          onChange={val => setData({...data, passLen: val})}
        />

        <Select
          label={t("Alphabet")}
          data={alphabetSelect}
          value={data.alphabet}
          onChange={val => setData({...data, alphabet: val})}
        />

        <Select
          label={t("Folder")}
          data={folderSelect}
          value={data.folder || ''}
          onChange={val => setData({...data, folder: val === '' ? undefined : val})}
        />

        <Checkbox
          label={t("Force all character groups")}
          checked={data.allGroups}
          onChange={e => setData({...data, allGroups: e.target.checked})}
        />

        <Checkbox
          label={t("Use random-seed algorithm (Not recommended)")}
          checked={data.useRandomSeed}
          onChange={e => setData({...data, useRandomSeed: e.target.checked})}
        />

        <Button variant="subtle" onClick={() => setShowAdvanced(false)}>
          {t('Hide advanced settings')}
        </Button>
      </>
      :
      <Button variant="subtle" onClick={() => setShowAdvanced(true)}>
        {t('Show advanced settings')}
      </Button>
    }

    <PasswordInput
      label={t("Password preview")}
      readOnly={true}
      value={password}
      disabled={!validated}
      defaultVisible={true}
    />

    <Group key="controls" position="right" noWrap>
      {remove ?
        <Popover width={200} position="top" withArrow shadow="md">
          <Popover.Target>
            <Button
              key={'remove'}
              color="dark"
              variant="subtle"
              leftIcon={<IconTrash size={16}/>}
              style={{flexGrow: 1}}
              compact
            >
              {t("Remove")}
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Text size="sm">{t("Are you sure you want to remove this service forever?")}</Text>
            <Button
              key={'remove-confirm'}
              color="red"
              mt={"md"}
              leftIcon={<IconAlertTriangle size={16}/>}
              onClick={remove}
            >
              {t("Remove")}
            </Button>
          </Popover.Dropdown>
        </Popover>

        : ''}

      <Button
        key="close"
        color="red"
        leftIcon={<IconX/>}
        onClick={discard}
      >{t("Close")}</Button>

      <Button
        key="save"
        color="blue"
        leftIcon={<IconCheck/>}
        onClick={() => save(data)}
      >{t("Save")}</Button>
    </Group>
  </Stack>;
}
