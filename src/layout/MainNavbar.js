import '../style/main-navbar.scss';
import {Navbar, Tooltip, UnstyledButton} from '@mantine/core';
import {IconAbc, IconHome2, IconLayoutGrid, IconSettings, IconShieldLock, IconUser} from '@tabler/icons-react';
import {usePage} from "../util/react";
import {t} from "../util/i18n";

const mainPages = [
  {id: 'home', icon: IconHome2, label: t("Home")},
  {id: 'services', icon: IconLayoutGrid, label: t("Services")},
  {id: 'secrets', icon: IconShieldLock, label: t("Secrets")},
  {id: 'alphabets', icon: IconAbc, label: t("Alphabets")},
  'spacer',
  {id: 'accounts', icon: IconUser, label: t("Accounts")},
  {id: 'settings', icon: IconSettings, label: t("Settings")},
];

/**
 * Side navbar
 * @returns {JSX.Element}
 * @constructor
 */
export function MainNavbar() {
  const {page, gotoPage} = usePage();

  const mainLinks = mainPages.map(link => {
    if (link === 'spacer') {
      return <div key="spacer" className="spacer"></div>;
    }

    return <Tooltip
      key={link.id}
      label={link.label}
      position="right"
      withArrow
      transitionProps={{duration: 0}}
    >
      <UnstyledButton
        onClick={() => gotoPage(link.id)}
        className={page !== link.id ? 'main-link' : 'main-link active'}
      >
        <link.icon size="60%" stroke={1.5}/>
      </UnstyledButton>
    </Tooltip>;
  });

  return (
    <Navbar height="100%" width={{sm: 0}} className="main-navbar">
      <Navbar.Section grow className="wrapper">
        <div className="aside">
          <div className="logo">
            <img src="/logo192.png" alt="Logo"/>
          </div>
          {mainLinks}
        </div>
      </Navbar.Section>
    </Navbar>
  );
}
