import React, {useState} from "react";
import {t} from "../util/i18n";
import {Button, Group, Popover, Select, Stack, Text, Textarea, TextInput} from "@mantine/core";
import {IconAlertTriangle, IconCheck, IconTrash, IconX} from "@tabler/icons-react";
import {useFolderSelectorOptions} from "../util/folder";
import {IconSelector} from "../components/IconSelector";

/**
 * Form for editing alphabet settings
 *
 * @param {Alphabet} alphabet
 * @param {(Alphabet)=>void} save
 * @param {()=>void} discard
 * @param {()=>void} remove
 * @returns {JSX.Element}
 * @constructor
 */
export function AlphabetSettingsForm({alphabet, save, discard, remove}) {
  /** @type {Secret} data */
  const [data, setData] = useState({...alphabet});
  const folderSelect = useFolderSelectorOptions();

  return <Stack>
    <TextInput
      label={t("Name")}
      value={data.name ?? ''}
      onChange={e => setData({...data, name: e.target.value})}
    />

    <Textarea
      label={t("Valid characters")}
      placeholder={t("Type all the characters that can be used to generate passwords, newlines get ignored")}
      value={data.chars}
      onChange={e => setData({...data, chars: e.target.value})}
      minRows={2}
      autosize={true}
    />

    <TextInput
      label={t("Description")}
      placeholder={t("Short description of the alphabet")}
      value={data.summary ?? ''}
      onChange={e => setData({...data, summary: e.target.value})}
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
        onClick={() => save(data)}
      >{t("Save")}</Button>
    </Group>
  </Stack>;
}
