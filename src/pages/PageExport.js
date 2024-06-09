import {Box, Button, Checkbox, Divider, Flex, Stack, Textarea, Title} from "@mantine/core";
import {t} from "../util/i18n";
import React, {useRef, useState} from "react";
import {exportAccount, importAccount} from "../util/export";
import {downloadAsFile, randId} from "../util/util";
import {externalStoreSettings, retrievePaste} from "../util/api";
import {report_error} from "../util/log";
import {useAccount} from "../util/react";

export function PageExport() {
  const {account, updateAccount} = useAccount();
  const [text, setText] = useState('');
  const [override, setOverride] = useState(false);
  const [exportResult, setExportResult] = useState('');
  const [exportIsError, setExportIsError] = useState(false);
  const auxInput = useRef();

  const exportData = (target) => {
    let date = (new Date()).toISOString();
    const data = exportAccount(account);

    if (target === 'file') {
      downloadAsFile(`settings-${date}.json`, data);
      setExportResult('Successfully exported settings');
      setExportIsError(false);
      return;
    }

    if (target === 'textarea') {
      setText(data);
      setExportResult('Successfully exported settings');
      setExportIsError(false);
      return;
    }

    if (target === 'external') {
      externalStoreSettings(account.settings, data).then(url => {
        setExportResult('Successfully exported settings');
        setExportIsError(false);
        updateAccount({settings: {...account.settings, externalServiceUrl: url}});
      }, e => {
        report_error(e);
        setExportResult('Unable to store setting in external service');
        setExportIsError(true);
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
        setExportResult(items);
        setExportIsError(true);
        return;
      }

      if (override) {
        if (window.confirm('Are you sure you want to override the current settings with the new settings?')) {
          updateAccount({alphabets: items.alphabets, services: items.services, secrets: items.secrets, settings: items.settings});
          setExportResult('Successfully imported settings');
          setExportIsError(false);
          return;
        }
      } else {
        if (window.confirm('Are you sure you want to merge the current settings with the new settings?')) {
          updateAccount({alphabets: items.alphabets, services: items.services, secrets: items.secrets, settings: items.settings});
          setExportResult('Successfully imported settings');
          setExportIsError(false);
          return;
        }
      }

      setExportResult('Importation cancelled');
      setExportIsError(false);
    } catch (e) {
      report_error(e);
      setExportResult('Error: ' + e.message);
      setExportIsError(true);
    }
  };

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

  </Stack>
}

function mergeSettings(a, b) {
  let res = {};
  // alphabets, services, secrets, settings

  if (a.alphabets) {
    res.alphabets = mergeLists(a.alphabets, b.alphabets, 'name');
  }

  if (a.services) {
    res.services = mergeLists(a.services, b.services, 'name');
  }

  if (a.secrets) {
    res.secrets = mergeLists(a.secrets, b.secrets, 'name');
  }

  if (a.settings) {
    res.settings = {
      ...b.settings,
      defaultPasswordLength: a.settings.defaultPasswordLength,
      defaultShowPassword: a.settings.defaultShowPassword,
      defaultAllGroups: a.settings.defaultAllGroups,
      defaultRandomSeed: a.settings.defaultRandomSeed,
      darkTheme: a.settings.darkTheme,
    };
  }

  return res;
}

function mergeLists(listA, listB, key) {
  let map = new Map();

  listB.forEach(B => {
    B.id = randId();
    map.set(B[key], B);
  });

  listA.forEach(A => {
    A.id = randId();

    // If there is an item in A that is not in B, add it to the map
    if (!map.has(A[key])) {
      map.set(A[key], A);
    }
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
