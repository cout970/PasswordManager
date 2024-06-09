import {Button, Flex, PasswordInput, Text, TextInput} from "@mantine/core";
import {useMemo, useState} from "react";
import {t} from "../util/i18n";
import {useDebouncedValue} from "@mantine/hooks";
import {getServicePassword} from "../util/util";
import {createService} from "../util/entities";
import {useAccount} from "../util/react";
import {IconCopy} from "@tabler/icons-react";
import {copyServicePasswordToClipboard} from "../pages/PageServices";

/**
 * Simple form asking for a service code and displaying the generated password.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export function SingleUseGenerator() {
  const {account} = useAccount();
  const [code, setCode] = useState('');
  const [codeDebounced] = useDebouncedValue(code, 200);

  const fakeService = useMemo(() => createService(account.settings), [account]);

  /** @type {string} */
  const pass = useMemo(() => {
    if (!codeDebounced) return '';
    fakeService.code = codeDebounced;

    const {password} = getServicePassword(fakeService, account.alphabets, account.masterPassword);

    return password;
  }, [account, fakeService, codeDebounced]);

  return <Flex className="single-use" align="center" gap="md" justify="end">
    <Text className="single-use-text">
      {t("Single use")}
    </Text>

    <TextInput
      className="single-use-input"
      placeholder={t("Service code")}
      value={code}
      onChange={e => setCode(e.target.value)}
    />

    {account.settings.defaultShowPassword ?
      <TextInput
        key="password-shown"
        className="single-use-password"
        readOnly={true}
        value={pass}
        placeholder={t("Output")}
      />
      :
      <PasswordInput
        key="password-hidden"
        className="single-use-password"
        readOnly={true}
        value={pass}
        placeholder={t("Output")}
      />
    }

    <Button
      className="single-use-btn"
      variant="subtle"
      leftIcon={<IconCopy size={16}/>}
      disabled={pass === ''}
      onClick={() => copyServicePasswordToClipboard(fakeService, account)}
    >
      {t("Copy")}
    </Button>

  </Flex>;
}
