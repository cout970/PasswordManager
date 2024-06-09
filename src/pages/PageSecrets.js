import '../style/page-secrets.scss';
import '../style/card.scss';
import {Modal, SimpleGrid, Stack, Text, Textarea, Title, UnstyledButton} from '@mantine/core';
import React, {useMemo, useState} from 'react';
import {IconPlus, IconSettings} from '@tabler/icons-react';
import {copyToClipboard, decodeSecretContents, searchBy, sha512} from '../util/util';
import {useAccount} from "../util/react";
import {t} from "../util/i18n";
import {notifications} from "@mantine/notifications";
import {ControlsBar} from "../layout/ControlsBar";
import {NewSecretModal} from "../components/NewSecretModal";
import {SecretSettingsModal} from "../components/SecretSettingsModal";
import {IconDisplay} from "../components/IconSelector";
import {removeDuplicates} from "../util/entities";

export function PageSecrets() {
  const {account, updateAccount} = useAccount();
  const secrets = account.secrets;

  const [searchFilter, setSearchFilter] = useState('');

  const visibleSecrets = useMemo(
    () => searchBy(secrets, s => s.name + ': ' + s.description, searchFilter),
    [searchFilter, secrets],
  );

  const [openModal, setOpenModal] = useState(false);

  return <Stack className="page page-secrets">
    <Title order={1}>{t("Secrets")}</Title>

    <ControlsBar
      setSearchFilter={setSearchFilter}
      addItemBtn={() => setOpenModal(true)}
      removeDups={() => removeDuplicates(account, updateAccount, 'secrets')}
    />

    <SimpleGrid
      key="secrets"
      className="secrets"
      cols={6}
      breakpoints={[
        {maxWidth: '62rem', cols: 3},
        {maxWidth: '48rem', cols: 2},
        {maxWidth: '36rem', cols: 1},
      ]}
      spacing={'md'}
    >
      {visibleSecrets.map(s =>
        <SecretCard
          key={s.id}
          secret={s}
        />,
      )}

      {searchFilter === ''
        ? <FakeSecretCard onClick={() => setOpenModal(true)}/>
        : ''
      }
    </SimpleGrid>

    <NewSecretModal
      key="new"
      open={openModal}
      onClose={() => setOpenModal(false)}
    />
  </Stack>;
}

function SecretCard({secret}) {
  const [open, setOpen] = useState(false);
  const {account} = useAccount();

  const {contents, validated} = useMemo(
    () => {
      const contents = decodeSecretContents(account.masterPassword, secret.contents);
      const validated = secret.sha512 === sha512(contents);
      return {contents, validated};
    },
    [secret, account],
  );

  const copy = () => copySecretToClipboard(secret, account);

  return <Stack
    align="center"
    className={validated ? 'card' : 'card invalid'}
  >
    <Text
      className="card-name"
      onClick={copy}
    >{secret.name}</Text>

    <div
      className="card-img"
      onClick={copy}
    >
      <IconDisplay
        value={secret.icon}
        alt={secret.name}
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

      <SecretSettingsModal
        key="modal"
        value={secret}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>

    <Modal
      title="Secret"
      opened={open}
      onClose={() => setOpen(false)}
      centered
    >
      <Textarea
        value={contents}
        readOnly
      />
    </Modal>
  </Stack>;
}

function FakeSecretCard({onClick}) {
  return <Stack
    align="center"
    className="card fake-card"
    onClick={onClick}
  >
    <Text className="card-name">{t('Create secret')}</Text>

    <div className="card-img">
      <IconPlus size="100%"/>
    </div>
  </Stack>
}

export function copySecretToClipboard(secret, account) {
  const contents = decodeSecretContents(account.masterPassword, secret.contents);
  const validated = secret.sha512 === sha512(contents);

  if (!account.masterPassword) {
    notifications.show({
      title: t("Error"),
      message: t("Master password is empty"),
      color: 'red',
    });
    return;
  }

  if (!validated) {
    notifications.show({
      title: t("Error"),
      message: t("Secret requires a different master password"),
      color: 'red',
    });
    return;
  }

  copyToClipboard(contents)
    .then(
      () => notifications.show({
        title: t("Secret copied"),
        message: t("Secret copied to clipboard", {name: secret.name}),
        color: 'blue',
      }),
      () => notifications.show({
        title: t("Error"),
        message: t("Unable to copy secret to clipboard"),
        color: 'red',
      }),
    );
}
