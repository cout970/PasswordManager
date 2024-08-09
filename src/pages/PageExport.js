import {Box, Button, Checkbox, Divider, Flex, Stack, Textarea, Title, Text, rem, SimpleGrid} from "@mantine/core";
import {t} from "../util/i18n";
import {useState} from "react";
import {exportAccount, importAccount} from "../util/export";
import {downloadAsFile} from "../util/util";
import {externalStoreSettings, retrievePaste} from "../util/api";
import {report_error} from "../util/log";
import {useAccount} from "../util/react";
import {showNotification} from "@mantine/notifications";

export function PageExport() {
  const {account, updateAccount} = useAccount();
  const [text, setText] = useState('');
  const [override, setOverride] = useState(false);
  const [changes, setChanges] = useState(null);

  const exportData = (target) => {
    let date = (new Date()).toISOString();
    const data = exportAccount(account);

    if (target === 'file') {
      downloadAsFile(`settings-${date}.json`, data);
      showNotification({message: 'Settings exported to file', color: 'green'});
      return;
    }

    if (target === 'textarea') {
      setText(data);
      showNotification({message: 'Settings exported to textarea', color: 'green'});
      return;
    }

    if (target === 'external') {
      externalStoreSettings(account.settings, data).then(url => {
        updateAccount({settings: {...account.settings, externalServiceUrl: url}});
        showNotification({message: 'Settings exported to service', color: 'green'});
      }, e => {
        report_error(e);
        showNotification({message: 'Unable to save settings in service', color: 'red'});
      });
      return;
    }

    report_error('Invalid target: ' + target);
  };

  const importData = async (target) => {
    let data;
    try {
      if (target === 'textarea') {
        data = text;
      } else if (target === 'file') {
        data = await askUserForFile();
      } else if (target === 'external') {
        data = await retrievePaste(account.settings.externalServiceUrl);
      }

      const [error, items] = importAccount(account.masterPassword, data);

      if (error) {
        setChanges(null);
        showNotification({message: 'Error loading settings:' + items, color: 'red'});
        return;
      }

      if (override) {
        setChanges(items);
      } else {
        setChanges(mergeSettings(items, account));
      }
      showNotification({message: 'Settings loaded, click import changes to finish', color: 'green'})
    } catch (e) {
      report_error(e);
      showNotification({message: 'Error loading settings', color: 'red'});
      setChanges(null);
    }
  };

  const finishImport = () => {
    const msg = override
      ? 'Are you sure you want to override the current settings with the new settings?'
      : 'Are you sure you want to merge the current settings with the new settings?';

    if (window.confirm(msg)) {
      updateAccount(changes);
      showNotification({message: 'Settings imported', color: 'green'});
    }
  }

  return <Stack className="page page-export">
    <Title order={1}>{t("Export")}</Title>

    <Stack className="import">
      <Title order={3}>{t("Import settings")}</Title>

      <Flex wrap="wrap" gap="md">
        <Button
          onClick={() => importData('textarea')}
          className="import-button"
          color="blue"
          variant="outline"
          disabled={!text || !account.masterPassword}
          title={t('Load config from the textarea')}
        >
          Textarea
        </Button>

        <Button
          onClick={() => importData('file')}
          className="import-button"
          color="blue"
          variant="outline"
          disabled={!account.masterPassword}
          title={t('Load config from a file')}
        >
          File
        </Button>

        <Button
          onClick={() => importData('external')}
          className="import-button"
          color="blue"
          variant="outline"
          disabled={!account.settings.externalServiceLoad || !account.settings.externalServiceUrl || !account.masterPassword}
          title={t('Load config from the external service')}
        >
          External service
        </Button>
      </Flex>
    </Stack>

    <Stack className="export">
      <Title order={3}>{t("Export settings")}</Title>

      <Flex wrap="wrap" gap="md">
        <Button
          onClick={() => exportData('textarea')}
          className="import-button"
          color="blue"
          variant="outline"
          title={t('Export config into the textarea')}
        >
          Textarea
        </Button>

        <Button
          onClick={() => exportData('file')}
          className="import-button"
          color="blue"
          variant="outline"
          title={t('Export config into a file and download the file')}
        >
          File
        </Button>

        <Button
          onClick={() => exportData('external')}
          className="import-button"
          color="blue"
          variant="outline"
          disabled={!account.settings.externalServiceStore || !account.settings.externalServiceAccount}
          title={t('Export config to the configured external service')}
        >
          External service
        </Button>
      </Flex>

      <Divider/>

      <Box>
        <Checkbox
          label={t("Override instead of merge configs")}
          checked={override}
          onChange={e => setOverride(e.target.checked)}
          mb="md"
        />

        <Textarea
          name="export-import"
          id="export-import"
          label={t("Export/Import buffer")}
          cols="30"
          rows="10"
          autosize
          onChange={e => setText(e.target.value)}
          value={text}
        />
      </Box>
    </Stack>

    <SettingsDiff account={account} changes={changes} onAccept={finishImport}/>
  </Stack>
}

function SettingsDiff({account, changes, onAccept}) {
  if (changes == null) return 'No settings to import';

  const diff = [];

  collectDiff(account.services, changes.services ?? account.services, diff);
  collectDiff(account.secrets, changes.secrets ?? account.secrets, diff);
  collectDiff(account.alphabets, changes.alphabets ?? account.alphabets, diff);
  collectDiff(account.folders, changes.folders ?? account.folders, diff);
  const oldSettings = Object.entries(account.settings)
    .map(([key, value]) => ({id: key, type: 'setting', name: key, value: value}));
  const newSettings = Object.entries(changes.settings ?? account.settings)
    .map(([key, value]) => ({id: key, type: 'setting', name: key, value: value}));
  collectDiff(oldSettings, newSettings, diff);

  diff.sort((a, b) => a.value.type === b.value.type
    ? a.value.name.localeCompare(b.value.name)
    : a.value.type.localeCompare(b.value.type)
  );

  if (diff.length === 0) return 'No changes in settings to import, already up to date.';

  return <Box>
    <Title>Changes</Title>
    <Stack
      spacing="0"
      p={rem(10)}
      style={{boder: "1px solid red"}}
    >
      {diff.map((item, index) => <DiffSummary key={index} item={item}/>)}
    </Stack>
    <Button onClick={() => onAccept()}>Import changes</Button>
  </Box>;
}

function DiffSummary({item}) {
  const diffTypes = {'add': 'New value', 'remove': 'Removed value', 'change': 'Changed value'};
  const itemTypes = {
    'setting': 'Setting',
    'service': 'Service',
    'secret': 'Secret',
    'alphabet': 'Alphabet',
    'folder': 'Folder'
  };

  const colors = {
    'add': 'green',
    'remove': 'red',
    'change': 'blue'
  }

  return <SimpleGrid cols={5}>
    <Text color={colors[item.type]}>{item.value.id}</Text>
    <Text color={colors[item.type]}>{diffTypes[item.type]}</Text>
    <Text color={colors[item.type]}>{itemTypes[item.value.type] ?? item.value.type}</Text>
    <Text color={colors[item.type]}>{item.value.name}</Text>
    <Text color={colors[item.type]}>{item.value.username || item.value.description || item.value.summary || '-'}</Text>
  </SimpleGrid>;
}

function collectDiff(listA, listB, diff) {
  const mapA = new Map();
  listA.forEach(A => mapA.set(A.id, A));
  const mapB = new Map();
  listB.forEach(B => mapB.set(B.id, B));
  const keys = new Set([...mapA.keys(), ...mapB.keys()]);

  keys.forEach(key => {
    const A = mapA.get(key);
    const B = mapB.get(key);

    if (!A) {
      diff.push({type: 'add', value: B});
    } else if (!B) {
      diff.push({type: 'remove', value: A});
    } else if (JSON.stringify(A) !== JSON.stringify(B)) {
      diff.push({type: 'change', value: B});
    }
  })
}

function mergeSettings(items, account) {
  let changes = {};

  if (items.alphabets) {
    changes.alphabets = mergeLists(items.alphabets, account.alphabets, 'id');
  }

  if (items.services) {
    changes.services = mergeLists(items.services, account.services, 'id');
  }

  if (items.secrets) {
    changes.secrets = mergeLists(items.secrets, account.secrets, 'id');
  }

  if (items.folders) {
    changes.folders = mergeLists(items.folders, account.folders, 'id');
  }

  if (items.settings) {
    changes.settings = {...account.settings, ...items.settings};
  }

  return changes;
}

function mergeLists(newValues, oldValues, key) {
  let map = new Map();

  oldValues.forEach(B => {
    map.set(B[key], B);
  });

  // Override values with the same key
  newValues.forEach(A => {
    map.set(A[key], A);
  });

  return [...map.values()];
}

function askUserForFile() {
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json, text/plain';

  let promise = new Promise((resolve, reject) => {
    input.onchange = e => {
      let file = e.target.files[0];

      let reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = readerEvent => {
        let content = readerEvent.target.result;
        resolve(content);
      };
      reader.onerror = e => {
        reject(e);
      }
    };
  });
  input.click();
  return promise;
}
