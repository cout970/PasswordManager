import '../style/page-accounts.scss';
import {Button, Flex, Group, Stack, Text, TextInput, Title} from '@mantine/core';
import {t} from "../util/i18n";
import {usePage} from "../util/react";
import React, {useContext, useMemo, useState} from "react";
import {getMasterPasswordHash, MasterPasswordColorBox} from "../components/MasterPasswordInput";
import {useDebouncedValue} from "@mantine/hooks";
import {randId, searchBy} from "../util/util";
import {IconCopy, IconEdit, IconPlus, IconSearch, IconSelect, IconTrash} from "@tabler/icons-react";
import {AccountContext} from "../layout/Main";
import {NewAccountModal} from "../forms/NewAccountForm";

/**
 * The accounts page
 *
 * Lists all accounts, allows adding new accounts, and switching between accounts
 *
 * @returns {JSX.Element}
 * @constructor
 */
export function PageAccounts() {
  const {gotoPage} = usePage();
  /** @type {AccountManager} */
  const accountManager = useContext(AccountContext);

  const allAccounts = accountManager.getAllAccounts();
  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch] = useState('');
  const [searchDebounced] = useDebouncedValue(search, 200);

  const visibleAccounts = useMemo(
    () => searchDebounced ? searchBy(allAccounts, getAccountLabel, searchDebounced) : allAccounts,
    [allAccounts, searchDebounced],
  );

  return <Stack className="page page-accounts">
    <Title order={1}>{t("Accounts")}</Title>

    <Group key="controls" position="apart">
      <TextInput
        key="search"
        placeholder={t("Search")}
        icon={<IconSearch size={16}/>}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <Button
        key="add"
        leftIcon={<IconPlus size={16}/>}
        onClick={() => setOpenModal(true)}
      >{t("Add account")}</Button>
    </Group>

    <Stack mt="md">
      {visibleAccounts.map(a =>
        <AccountSelectItem
          key={a.id}
          account={a}
          selectedAccount={accountManager.getCurrentAccount()}
          edit={() => gotoPage("settings")}
          select={() => accountManager.switchAccount(a)}
          remove={() => accountManager.removeAccount(a)}
          duplicate={() => accountManager.addAccount({
            ...structuredClone(a),
            id: randId(),
            settings: {
              ...structuredClone(a.settings),
              accountName: t("Copy of ") + (a.settings.accountName) || 'Account',
            },
          })}
        />
      )}
    </Stack>

    <NewAccountModal
      key="new"
      open={openModal}
      setOpen={setOpenModal}
      addAccount={a => accountManager.addAccount(a)}
    />
  </Stack>;
}

/**
 * Each row in the accounts list
 *
 * @param account
 * @param selectedAccount
 * @param remove
 * @param edit
 * @param select
 * @param duplicate
 * @returns {JSX.Element}
 * @constructor
 */
function AccountSelectItem({account, selectedAccount, remove, edit, select, duplicate}) {
  const tryDelete = () => {
    if (window.confirm(t("Are you sure you want to delete this account? This action cannot be undone."))) {
      remove();
    }
  };

  return <Flex className="account-select-item" justify="space-between" gap="md" align="center">
    <Flex align="center" wrap="wrap" gap="xs">
      <MasterPasswordColorBox value={account.masterPassword}/>
      <Text weight="bold" size="lg">{(account.settings.accountName || 'Default account')}</Text>
    </Flex>

    <Flex gap="md" wrap="wrap" className="account-actions">
      <Button
        color="red"
        variant="outline"
        leftIcon={<IconTrash size={16}/>}
        disabled={account === selectedAccount}
        onClick={tryDelete}
      >
        {t("Delete")}
      </Button>

      <Button
        color="blue"
        variant="outline"
        leftIcon={<IconCopy size={16}/>}
        onClick={duplicate}
      >
        {t("Duplicate")}
      </Button>

      <Button
        color="blue"
        variant="outline"
        leftIcon={<IconEdit size={16}/>}
        disabled={account !== selectedAccount}
        onClick={edit}
      >
        {t("Edit")}
      </Button>

      <Button
        leftIcon={<IconSelect size={16}/>}
        disabled={account === selectedAccount}
        onClick={select}
      >
        {t("Select")}
      </Button>
    </Flex>
  </Flex>;
}

/**
 * @param {Account} account
 * @returns {string}
 */
function getAccountLabel(account) {
  const hash = getMasterPasswordHash(account.masterPassword).substring(0, 8)
  return '[' + hash + '] ' + (account.settings.accountName || 'Default account');
}
