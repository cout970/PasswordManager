import {Button, Group, Popover, Stack, Text, TextInput} from "@mantine/core";
import {t} from "../util/i18n";
import React, {useState} from "react";
import {IconAlertTriangle, IconCheck, IconTrash, IconX} from "@tabler/icons-react";

export function FolderSettingsForm({value, save, remove, discard}) {
  const [data, setData] = useState({...value});

  return <Stack>
    <TextInput
      label={t("Name")}
      value={data.name}
      onChange={e => setData({...data, name: e.target.value})}
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
            <Text size="sm">{t("Are you sure you want to remove this folder?")}</Text>
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
