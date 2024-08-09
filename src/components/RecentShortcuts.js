import {useAccount} from "../util/react";
import {Divider, Flex, rem, Text} from "@mantine/core";
import React from "react";
import {IconDisplay} from "./IconSelector";
import {copyServicePasswordToClipboard} from "../pages/PageServices";
import {copySecretToClipboard} from "../pages/PageSecrets";

export function RecentShortcuts() {
  const {account} = useAccount();

  const recent = [...account.services, ...account.secrets].filter(a => a.uses > 0);
  recent.sort((a, b) => a.uses === b.uses ? b.lastUse - a.lastUse : b.uses - a.uses);

  if (recent.length === 0) return '';

  return <>
    <Divider my="md"/>
    <Flex gap="md" wrap="wrap">
      {recent.slice(0, 5).map(a => <Shortcut key={a.id} item={a}/>)}
    </Flex>
    </>;
}

function Shortcut({item}) {
  const {account, updateAccount} = useAccount();

  const click = () => {
    if (item.type === 'secret') {
      copySecretToClipboard(item, account);
    } else if (item.type === 'service') {
      copyServicePasswordToClipboard(item, account);
    }
  }

  return <Flex
    className="home-shortcut"
    align="center"
    justify="center"
    gap="md"
    onClick={click}
  >
    <IconDisplay
      value={item.icon}
      alt={item.name}
      size={rem(32)}
    />
    <Text>{item.name}</Text>
  </Flex>;
}