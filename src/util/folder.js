import {copyServicePasswordToClipboard} from "../pages/PageServices";
import {copySecretToClipboard} from "../pages/PageSecrets";
import {useAccount} from "./react";
import {useMemo} from "react";
import {t} from "./i18n";

/**
 * @returns {[{label: string, value: string}]}
 */
export function useFolderSelectorOptions() {
  const {account} = useAccount();

  return useMemo(() => {
    const all = [
      {label: t("No folder"), value: ''},
    ];
    account.folders.forEach(folder => {
      collectAllFolders(folder, '', all)
    });
    return all;
  }, [account]);
}

/**
 * @param {Folder} folder
 * @param {string} path
 * @param {{label: string, value: string}[]} result
 */
export function collectAllFolders(folder, path, result) {
  result.push({
    label: path ? path + '/' + folder.name : folder.name,
    value: folder.id,
  });

  folder.children.forEach(subFolder => {
    collectAllFolders(subFolder, path ? path + '/' + folder.name : folder.name, result)
  });
}

export function collectAllFolderContents(folder, account, open, setOpen, parents, result) {
  const isOpen = open[folder.id];
  const isEmpty = folder.children.length === 0 &&
    account.services.filter(s => s.folder === folder.id).length === 0 &&
    account.secrets.filter(s => s.folder === folder.id).length === 0 &&
    account.alphabets.filter(s => s.folder === folder.id).length === 0;

  result.push({
    item: folder,
    id: 'folder:' + folder.id,
    type: 'folder',
    name: folder.name,
    parents: parents,
    isEmpty: isEmpty,
    isFirst: result.length === 0,
    isOpen: isOpen,
    onClick: () => {
      setOpen({...open, [folder.id]: !open[folder.id]});
    }
  });

  if (!isOpen) {
    return;
  }

  const count = result.length;
  const newParents = [...parents, folder.name];

  folder.children.forEach(folder => {

    collectAllFolderContents(folder, account, open, setOpen, newParents, result);
  });

  collectFolderFileContents(folder, account, newParents, result);

  if (result.length > count) {
    result[result.length - 1].isEnd = true;
  }
}

export function collectFolderFileContents(folder, account, parents, result) {
  account.services.forEach(service => {
    if (service.folder !== folder?.id) {
      return;
    }

    result.push({
      item: service,
      id: 'service:' + service.id,
      type: 'service',
      name: service.name,
      parents: parents,
      icon: service.icon,
      onClick: () => copyServicePasswordToClipboard(service, account),
    });
  });

  account.secrets.forEach(secret => {
    if (secret.folder !== folder?.id) {
      return;
    }

    result.push({
      item: secret,
      id: 'secret:' + secret.id,
      type: 'secret',
      name: secret.name,
      parents: parents,
      icon: secret.icon,
      onClick: () => copySecretToClipboard(secret, account),
    });
  });

  account.alphabets.forEach(alphabet => {
    if (alphabet.folder !== folder?.id) {
      return;
    }

    result.push({
      item: alphabet,
      id: 'alphabet:' + alphabet.id,
      type: 'alphabet',
      name: alphabet.name,
      parents: parents,
      icon: alphabet.icon,
      onClick: () => {
      },
    });
  });

  return result;
}

export function replaceFolder(folders, newFolder) {
  return folders.map(folder => {
    if (folder.id === newFolder.id) {
      return newFolder;
    }

    return {
      ...folder,
      children: replaceFolder(folder.children, newFolder),
    };
  })
}

export function removeFolder(folders, newFolder) {
  return folders.map(folder => {
    if (folder.id === newFolder.id) {
      return null;
    }

    return {
      ...folder,
      children: removeFolder(folder.children, newFolder),
    };
  }).filter(folder => folder !== null);
}

function mapFolder(folders, func) {
  return folders.map(folder => {
    let mod = func(folder);
    return {
      ...mod,
      children: mapFolder(mod.children, func),
    };
  });
}

function forEachFolder(folders, func) {
  folders.forEach(folder => {
    func(folder);
    forEachFolder(folder.children, func);
  });
}

function filterFolder(folders, func) {
  return folders.map(folder => {
    if (!func(folder)) return null;
    return {
      ...folder,
      children: filterFolder(folder.children, func),
    };
  }).filter(folder => folder !== null);
}

function findFolder(folders, func) {
  for (let folder of folders) {
    if (func(folder)) {
      return folder;
    }

    let found = findFolder(folder.children, func);
    if (found) {
      return found;
    }
  }

  return null;
}

function printFolders(folders, indent = 0) {
  folders.forEach(folder => {
    console.log(' '.repeat(indent) + '- [' + folder.id + ']' + folder.name);
    printFolders(folder.children, indent + 2);
  });
}

export function moveFolder(folders, thisFolder, targetFolderId) {
  // Parent doesn't exist
  if (!findFolder(folders, f => f.id === targetFolderId)) {
    return folders;
  }

  // This folder is parent of target folder, would cause an infinite loop
  if (isFolderChildOf(folders, targetFolderId, thisFolder.id)) {
    return folders;
  }

  // Remove thisFolder
  const thisRemoved = filterFolder(folders, f => f.id !== thisFolder.id)

  // Add thisFolder back at the correct location
  return mapFolder(thisRemoved, current => {
    return {
      ...current,
      children: current.id === targetFolderId
        ? [...current.children, thisFolder]
        : current.children,
    }
  });
}

/**
 * Returns true if the folder with [childId] is a child of the folder with [parentId]
 *
 * @param {Folder[]} folders
 * @param {string} childId
 * @param {string} parentId
 * @returns {boolean}
 */
export function isFolderChildOf(folders, childId, parentId) {
  const parentFolder = findFolder(folders, f => f.id === parentId);

  if (!parentFolder) {
    return false;
  }

  if (parentFolder.children.find(f => f.id === childId)) {
    return true;
  }

  return parentFolder.children.some(f => isFolderChildOf(folders, childId, f.id));
}
