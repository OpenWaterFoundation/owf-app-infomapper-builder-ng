import { Injectable }   from '@angular/core';
import { ParamAccount } from '../infomapper-builder-types';


@Injectable({
    providedIn: 'root'
})
// https://stackoverflow.com/questions/46601155/keep-data-in-page-after-refresh
export class LocalStorageService {

  /** Name to be used as the localStorage key for the current user's ParamAccount
   * from the AWS SSM. */
  private userParamAccount = 'userParamAccount';


  /**
   * The constructor for the LocalStorageService.
   */
  constructor() {
  }


  /**
   * Uses localStorage to set the current user's ParamAccount from the AWS SSM.
   * @param paramAccount The ParamAccount of the current user to set.
   */
  setUserParamAccount(paramAccount: ParamAccount) {
    localStorage.setItem(this.userParamAccount, JSON.stringify(paramAccount));
  }

  /**
   * Gets the `userParamAccount` object from localStorage.
   */
  getUserParamAccount(): ParamAccount {
    return JSON.parse(localStorage.getItem(this.userParamAccount));
  }

  /**
   * Removes the `userParamAccount` property and its value from localStorage.
   */
  clearUserParamAccount(): void {
    localStorage.removeItem(this.userParamAccount);
  }

  /**
   * Removes all properties from localStorage.
   */
  clearAll(): void {
    localStorage.clear()
  }
  
}