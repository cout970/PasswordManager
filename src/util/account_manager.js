import {
  getLocalStorage, loadSettings,
  getStorage,
  loadAlphabets,
  loadMasterPassword, loadSecrets,
  loadServices,
  saveAlphabets, saveMasterPassword, saveSecrets, saveServices, saveSettings, loadFolders, saveFolders
} from "./storage";
import {report_error} from "./log";
import {hashPasswordWithSalt, recursiveCollect} from "./util";
import {validateFolders} from "./entities";

export class AccountManager {
  allAccounts = [];
  currentAccount = null;
  refresh = () => null;

  constructor() {
    this.load();
    this.save();
  }

  load() {
    this.allAccounts = [];
    this.currentAccount = null;

    const local = getLocalStorage();
    let result;

    try {
      result = JSON.parse(local.getItem("all_accounts") || '');
    } catch (e) {
      report_error(e);
    }

    if (!result || !Array.isArray(result)) {
      return;
    }

    result.forEach(id => {
      const storage = getStorage(id);
      let account = {
        id: id,
        masterPassword: loadMasterPassword(storage),
        masterPasswordHash: storage.getItem('master-hash') || null,
        alphabets: loadAlphabets(storage),
        services: loadServices(storage),
        secrets: loadSecrets(storage),
        settings: loadSettings(storage),
        folders: loadFolders(storage),
      };

      account = validateFolders(account);

      this.allAccounts.push(account);
    });

    this.updateSelection();
  }

  updateSelection() {
    if (this.allAccounts.length === 0) {
      this.currentAccount = null;
      return;
    }

    const local = getLocalStorage();
    const selected_account = local.getItem("selected_account") || null;
    const otherAccount = this.allAccounts.find(a => a.id === selected_account);

    if (otherAccount) {
      this.currentAccount = otherAccount.id;
    } else {
      this.currentAccount = this.allAccounts[0].id;
    }
  }

  save() {
    const local = getLocalStorage();
    local.setItem("all_accounts", JSON.stringify(this.allAccounts.map(a => a.id)));
    local.setItem("selected_account", this.currentAccount);

    this.allAccounts.forEach(account => {
      const storage = getStorage(account.id);
      if (account.masterPassword) {
        // Rehash the password on save
        account.masterPasswordHash = hashPasswordWithSalt(account.masterPassword);
      }
      saveMasterPassword(account.masterPassword, account.masterPasswordHash, account.settings, storage);
      saveAlphabets(account.alphabets, storage);
      saveServices(account.services, storage);
      saveSecrets(account.secrets, storage);
      saveSettings(account.settings, storage);
      saveFolders(account.folders, storage);
    });
  }

  /** @returns {Account[]} */
  getAllAccounts() {
    return this.allAccounts;
  }

  /** @returns {Account|null} */
  getCurrentAccount() {
    return this.allAccounts.find(a => a.id === this.currentAccount) || null;
  }

  /** @param {Account} newAccount */
  addAccount(newAccount) {
    this.allAccounts.push(newAccount);
    this.switchAccount(newAccount);
  }

  /** @param {Account} newAccount */
  updateAccount(newAccount) {
    this.allAccounts = this.allAccounts.map(a => a.id === newAccount.id ? newAccount : a);
    this.save();
    this.refresh();
  }

  /** @param {Account} account */
  switchAccount({id}) {
    const otherAccount = this.allAccounts.find(a => a.id === id);
    if (!otherAccount) return;

    this.currentAccount = otherAccount.id;
    this.save();
    this.refresh();
  }

  /** @param {Account} account */
  removeAccount({id}) {
    this.allAccounts = this.allAccounts.filter(a => a.id !== id);
    this.updateSelection();
    this.save();
    this.refresh();
  }
}
