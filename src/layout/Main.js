import {Group, MantineProvider, Stack} from '@mantine/core';
import {MainNavbar} from './MainNavbar';
import '../style/main.scss';
import '../style/mantine.scss';
import {useState, createContext, useEffect} from 'react';
import {PageServices} from '../pages/PageServices';
import {Notifications} from '@mantine/notifications';
import {PageHome} from '../pages/PageHome';
import {PageSecrets} from '../pages/PageSecrets';
import {PageInit} from "../pages/PageInit";
import {PageSettings} from "../pages/PageSettings";
import {PageAccounts} from "../pages/PageAccounts";
import {AccountManager} from "../util/account_manager";
import {PageUnlock} from "../pages/PageUnlock";
import {PageAlphabets} from "../pages/PageAlphabets";

export const AccountContext = createContext(null);
export const NavigationContext = createContext(null);

export default function Main() {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [accountManager] = useState(() => {
    return new AccountManager()
  });

  const [page, gotoPage] = useState(
    accountManager.getCurrentAccount() == null
      ? 'init'
      : 'home'
  );

  useEffect(() => {
    let account = accountManager.getCurrentAccount();

    if (account == null && page !== 'init') {
      gotoPage('init');
    }

    if (account != null && account.masterPassword === '' && page !== 'unlock') {
      gotoPage('unlock');
    }
  }, [page, gotoPage, accountManager]);

  accountManager.refresh = () => setRefreshCounter(refreshCounter + 1);

  return <MantineProvider theme={{colorScheme: 'dark'}} withNormalizeCSS withGlobalStyles>
    <Notifications/>
    <NavigationContext.Provider value={[page, gotoPage]}>
      <AccountContext.Provider value={accountManager}>
        <Group className="main-wrapper" noWrap>

          {page !== 'init' && page !== 'unlock' &&
            <MainNavbar/>
          }

          <Stack className="main-content" style={{height: '100vh', overflowY: 'auto'}}>
            {page === 'init' && <PageInit/>}
            {page === 'unlock' && <PageUnlock/>}
            {page === 'home' && <PageHome/>}
            {page === 'services' && <PageServices/>}
            {page === 'secrets' && <PageSecrets/>}
            {page === 'alphabets' && <PageAlphabets/>}
            {page === 'accounts' && <PageAccounts/>}
            {page === 'settings' && <PageSettings/>}
          </Stack>
        </Group>
      </AccountContext.Provider>
    </NavigationContext.Provider>
  </MantineProvider>;
}
