/**
 * 
 */
export interface ParamAccountValues {
  accountPath?: string;
  accountType?: string;
  name?: string;
  region?: string;
  userPoolId?: string;
}

/**
 * 
 */
export interface ParamAccount {
  slug?: string;
  values?: ParamAccountValues;
}