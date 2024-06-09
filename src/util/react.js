import {useCallback, useContext} from "react";
import {AccountContext, NavigationContext} from "../layout/Main";

/**
 * Access the current page
 *
 * @returns {{page: string, gotoPage: (string)=>undefined}}
 */
export function usePage() {
  const [page, gotoPage] = useContext(NavigationContext);
  return {page, gotoPage};
}

/**
 * Access the account info
 *
 * @returns {{
 *  account: Account,
 *  updateAccount: (Partial<Account>)=>undefined,
 *  accountManager: AccountManager,
 *  switchAccount: (Account)=>undefined
 * }}
 */
export function useAccount() {
  const accountManager = useContext(AccountContext);
  const account = accountManager.getCurrentAccount();

  /** @type {(changes: Partial<Account>)=>undefined} */
  const updateAccount = useCallback((changes) => {
    /** @type {Account} newAccount */
    let newAccount = {...accountManager.getCurrentAccount(), ...changes};

    accountManager.updateAccount(newAccount);
  }, [accountManager]);

  /** @type {(otherAccount: Account)=>undefined} */
  const switchAccount = useCallback(
    (otherAccount) => accountManager.switchAccount(otherAccount),
    [accountManager]
  );

  return {account, updateAccount, switchAccount, accountManager};
}
