import '../style/page-home.scss';
import {Divider, Flex, Stack, Title} from '@mantine/core';
import {t} from "../util/i18n";
import React, {useState} from "react";
import {ControlsBar} from "../layout/ControlsBar";
import {SingleUseGenerator} from "../components/SingleUseGenerator";
import {FileTree} from "../layout/FileTree";
import {Shortcuts} from "../layout/Shortcuts";
import {NewFolderModal} from "../components/NewFolderModal";

/**
 * Main page of the app
 *
 * @returns {JSX.Element}
 * @constructor
 */
export function PageHome() {
  const [searchFilter, setSearchFilter] = useState('');
  const [openModal, setOpenModal] = useState(false);

  return <Stack className="page page-home">
    <Flex justify="space-between" align="center" wrap="wrap" gap="md">
      <Title
        order={1}
        style={{fontFamily: "PressStart2P"}}
      >{t("PASSWORD MANAGER")}</Title>

      <SingleUseGenerator/>
    </Flex>

    <Divider my="md"/>

    <ControlsBar
      key="controls"
      setSearchFilter={setSearchFilter}
      addItemBtn={() => setOpenModal(true)}
    />

    <FileTree searchFilter={searchFilter}/>

    <Divider my="md"/>

    <Shortcuts/>

    <NewFolderModal
      key="new"
      open={openModal}
      onClose={() => setOpenModal(false)}
    />
  </Stack>;
}

