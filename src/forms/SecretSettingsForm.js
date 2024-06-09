import React, {useCallback, useMemo, useState} from "react";
import {useAccount} from "../util/react";
import {t} from "../util/i18n";
import {collectAllFolders, useFolderSelectorOptions} from "../util/folder";
import {decodeSecretContents, encodeSecretContents, sha512} from "../util/util";
import {Button, Group, Popover, Select, Stack, Text, Textarea, TextInput} from "@mantine/core";
import {IconAlertTriangle, IconCheck, IconTrash, IconX} from "@tabler/icons-react";
import {IconSelector} from "../components/IconSelector";

/**
 * @param secret {Secret}
 * @param save {function(Secret)}
 * @param discard {function()}
 * @param remove {function()}
 * @returns {JSX.Element}
 * @constructor
 */
export function SecretSettingsForm({secret, save, discard, remove}) {
  /** @type {Secret} data */
  const [data, setData] = useState({...secret});
  const {account} = useAccount();
  const folderSelect = useFolderSelectorOptions();

  const {decodedContents, validated} = useMemo(() => {
    const decodedContents = decodeSecretContents(account.masterPassword, secret.contents);
    const validated = secret.sha512 === sha512(decodedContents);
    return {decodedContents, validated};
  }, [secret, account]);

  const preSave = useCallback(() => {
    if (data.decodedContents !== null && data.decodedContents !== undefined) {
      data.contents = encodeSecretContents(account.masterPassword, data.decodedContents);
      data.sha512 = sha512(data.decodedContents);
      data.decodedContents = null;
    }
    save(data);
  }, [account.masterPassword, save, data]);

  return <Stack>
    <TextInput
      label={t("Name")}
      value={data.name ?? ''}
      onChange={e => setData({...data, name: e.target.value})}
    />

    <Textarea
      label={t("Contents")}
      placeholder={t("Paste the secret text here")}
      value={data.decodedContents ?? decodedContents ?? ''}
      onChange={e => setData({...data, decodedContents: e.target.value})}
      minRows={10}
      autosize={true}
    />

    {!data.decodedContents && !validated ?
      <Text color="red">{t("Unable to decode contents: Incorrect master password")}</Text>
      : ''}

    <TextInput
      label={t("Description")}
      placeholder={t("(Optional) Short description to search for and identify the secret")}
      value={data.description ?? ''}
      onChange={e => setData({...data, description: e.target.value})}
    />

    <IconSelector
      value={data.icon}
      onChange={value => setData({...data, icon: value})}
    />

    <Select
      label={t("Folder")}
      data={folderSelect}
      value={data.folder || ''}
      onChange={val => setData({...data, folder: val === '' ? undefined : val})}
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
            <Text size="sm">{t("Are you sure you want to remove this secret forever?")}</Text>
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
        onClick={preSave}
      >{t("Save")}</Button>
    </Group>
  </Stack>;
}
