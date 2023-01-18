/**
 * 
 */
export interface ParamAccountValues {
  accountPath?: string;
  accountType?: string;
  accountName?: string;
  region?: string;
  userPoolId?: string;
  userPoolClientId?: string;
}

/**
 * 
 */
export interface ParamAccount {
  slug?: string;
  values?: ParamAccountValues;
}
