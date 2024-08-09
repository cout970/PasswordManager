import '../style/page-alphabets.scss';
import '../style/card.scss';
import {Flex, rem, Stack, Text, Title, UnstyledButton} from '@mantine/core';
import React, {useMemo, useState} from 'react';
import {IconSettings} from '@tabler/icons-react';
import {searchBy} from '../util/util';
import {useAccount} from "../util/react";
import {t} from "../util/i18n";
import {ControlsBar} from "../layout/ControlsBar";
import {AlphabetSettingsModal} from "../components/AlphabetSettingsModal";
import {NewAlphabetModal} from "../components/NewAlphabetModal";
import {IconDisplay} from "../components/IconSelector";
import {removeDuplicates} from "../util/entities";

export function PageAlphabets() {
  const {account, updateAccount} = useAccount();
  const alphabets = account.alphabets;

  const [searchFilter, setSearchFilter] = useState('');

  const visibleAlphabets = useMemo(
    () => searchBy(alphabets, 'name', searchFilter),
    [searchFilter, alphabets],
  );

  const [openModal, setOpenModal] = useState(false);

  return <Stack className="page page-alphabets">
    <Title order={1}>{t("Alphabets")}</Title>

    <ControlsBar
      setSearchFilter={setSearchFilter}
      addItemBtn={() => setOpenModal(true)}
      removeDups={() => removeDuplicates(account, updateAccount, 'alphabets')}
    />

    <Flex
      key="alphabets"
      className="alphabets"
      wrap="wrap"
      gap="md"
    >
      {visibleAlphabets.map(s =>
        <AlphabetCard
          key={s.id}
          alphabet={s}
        />,
      )}
    </Flex>

    <NewAlphabetModal
      key="new"
      open={openModal}
      onClose={() => setOpenModal(false)}
    />
  </Stack>;
}

function AlphabetCard({alphabet}) {
  const [open, setOpen] = useState(false);

  return <Stack
    align="center"
    className='card'
    w={rem(180)}
  >
    <Text
      className="card-name"
    >{alphabet.name}</Text>

    <div className="card-img">
      <IconDisplay
        value={alphabet.icon}
        alt={alphabet.name}
        size="100%"
      />
    </div>

    <div className="card-config">
      <UnstyledButton
        key="btn"
        onClick={() => setOpen(true)}
      >
        <IconSettings size={16}/>
      </UnstyledButton>

      <AlphabetSettingsModal
        key="modal"
        value={alphabet}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  </Stack>;
}

