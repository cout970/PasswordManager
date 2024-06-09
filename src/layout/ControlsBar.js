import React, {useEffect, useState} from "react";
import {useDebouncedValue} from "@mantine/hooks";
import {Button, Flex, Group, TextInput} from "@mantine/core";
import {t} from "../util/i18n";
import {IconPlus, IconSearch, IconTrash} from "@tabler/icons-react";

/**
 *
 * @param {(string)=>void} setSearchFilter
 * @param {()=>void} removeDups
 * @param {()=>void} addItemBtn
 * @returns {JSX.Element}
 * @constructor
 */
export function ControlsBar({setSearchFilter, removeDups, addItemBtn}) {
  const [search, setSearch] = useState('');
  const [searchDebounced] = useDebouncedValue(search, 200);

  useEffect(() => {
    setSearchFilter(searchDebounced);
  }, [setSearchFilter, searchDebounced]);

  return <Group key="controls" position="apart">
    <TextInput
      key="search"
      placeholder={t("Search")}
      icon={<IconSearch size={16}/>}
      value={search}
      onChange={e => setSearch(e.target.value)}
    />

    <Flex gap="md" wrap="wrap">
      {removeDups ?
        <Button
          key="remove_dups"
          variant="outline"
          color="red"
          leftIcon={<IconTrash size={16}/>}
          onClick={removeDups}
        >{t("Remove duplicates")}</Button>
        : null}

      {addItemBtn ?
        <Button
          key="add"
          leftIcon={<IconPlus size={16}/>}
          onClick={addItemBtn}
        >{t("Add")}</Button>
        : null}
    </Flex>
  </Group>
}
