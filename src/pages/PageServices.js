import '../style/page-services.scss';
import '../style/card.scss';
import React, {useMemo, useState} from 'react';
import {SimpleGrid, Stack, Text, Title, UnstyledButton,} from '@mantine/core';
import {IconPlus, IconSettings,} from '@tabler/icons-react';
import {copyToClipboard, getServicePassword, searchBy} from '../util/util';
import {notifications} from '@mantine/notifications';
import {useAccount} from "../util/react";
import {t} from "../util/i18n";
import {ControlsBar} from "../layout/ControlsBar";
import {NewServiceModal} from "../components/NewServiceModal";
import {ServiceSettingsModal} from "../components/ServiceSettingsModal";
import {IconDisplay} from "../components/IconSelector";
import {removeDuplicates} from "../util/entities";

export function PageServices() {
  const {account, updateAccount} = useAccount();
  const services = account.services;
  const [searchFilter, setSearchFilter] = useState('');

  /** @type {Service[]} */
  const visibleServices = useMemo(
    () => searchBy(services, 'name', searchFilter),
    [searchFilter, services],
  );

  const [openModal, setOpenModal] = useState(false);

  return <Stack className="page page-services">
    <Title order={1}>{t("Services")}</Title>

    <ControlsBar
      setSearchFilter={setSearchFilter}
      addItemBtn={() => setOpenModal(true)}
      removeDups={() => removeDuplicates(account, updateAccount, 'services')}
    />

    <SimpleGrid
      key="services"
      className="services"
      cols={6}
      breakpoints={[
        {maxWidth: '62rem', cols: 3},
        {maxWidth: '48rem', cols: 2},
        {maxWidth: '36rem', cols: 1},
      ]}
      spacing={'md'}
    >
      {visibleServices.map(s =>
        <ServiceCard
          key={s.id}
          service={s}
        />,
      )}

      {searchFilter === ''
        ? <FakeServiceCard onClick={() => setOpenModal(true)}/>
        : ''
      }
    </SimpleGrid>

    {searchFilter !== '' && visibleServices.length === 0
      ? <Text className="no-results">{t('No results')}</Text>
      : ''
    }

    <NewServiceModal
      key="new"
      open={openModal}
      onClose={() => setOpenModal(false)}
    />
  </Stack>;
}

/**
 *
 * @param service {Service}
 * @returns {React.ReactElement}
 * @constructor React.ReactElement
 */
function ServiceCard({service}) {
  const [open, setOpen] = useState(false);
  const {account} = useAccount();

  const {seed, validated} = useMemo(
    () => getServicePassword(service, account.alphabets, account.masterPassword),
    [service, account],
  );

  const copy = () => copyServicePasswordToClipboard(service, account);

  return <Stack
    align="center"
    className={validated ? 'card' : 'card invalid'}
    data-seed={seed}
  >
    <Text
      className="card-name"
      onClick={copy}
    >{service.name}</Text>

    <div
      className="card-img"
      onClick={copy}
    >
      <IconDisplay
        value={service.icon}
        alt={service.name}
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

      <ServiceSettingsModal
        key="modal"
        open={open}
        onClose={() => setOpen(false)}
        value={service}
      />
    </div>
  </Stack>;
}

/**
 *
 * @param onClick {function()}
 * @returns {JSX.Element}
 * @constructor
 */
function FakeServiceCard({onClick}) {
  return <Stack
    align="center"
    className="card fake-card"
    onClick={onClick}
  >
    <Text className="card-name">{t("Create service")}</Text>

    <div className="card-img">
      <IconPlus size="100%"/>
    </div>
  </Stack>;
}

/**
 * Copy service password to clipboard
 *
 * @param service
 * @param account
 */
export function copyServicePasswordToClipboard(service, account) {
  const {password, validated} = getServicePassword(service, account.alphabets, account.masterPassword);

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
      message: t("Service requires a different master password"),
      color: 'red',
    });
    return;
  }

  copyToClipboard(password)
    .then(
      () => notifications.show({
        title: t("Password copied"),
        message: t("Password copied to clipboard", {name: service.name}),
        color: 'blue',
      }),
      () => notifications.show({
        title: t("Error"),
        message: t("Unable to copy password to clipboard"),
        color: 'red',
      }),
    );
}
