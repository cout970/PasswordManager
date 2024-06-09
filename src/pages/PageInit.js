import {Modal, Stack, Text} from "@mantine/core";
import {t} from "../util/i18n";
import React, {useCallback, useContext} from "react";
import {usePage} from "../util/react";
import {NewAccountForm} from "../forms/NewAccountForm";
import {AccountContext} from "../layout/Main";

/**
 * Initial page shown to the user when no account exists
 *
 * @returns {JSX.Element}
 * @constructor
 */
export function PageInit() {
  const {gotoPage} = usePage();
  /** @type {AccountManager} */
  const accountManager = useContext(AccountContext);

  const submit = useCallback((newAccount) => {
    accountManager.addAccount(newAccount);
    gotoPage('home');
  }, [gotoPage, accountManager]);

  return <Stack className="page page-home">
    <Modal
      title={<Text size={38}>{t("Let's start")}</Text>}
      opened={true}
      withCloseButton={false}
      centered
      onClose={() => undefined}
    >
      <Text size="md">
        {t("To get started, create a strong and memorable master password.\n" +
          "You will need this password in order to access all your data, so make sure you don't forget it!")}
      </Text>

      <a href="https://www.useapassphrase.com/" target="_blank" rel="noreferrer">
        <Text size="xs" mb="md">
          {t("Consider using a passphrase to make it easier to remember")}
        </Text>
      </a>

      <NewAccountForm submit={submit}/>
    </Modal>
  </Stack>;
}

