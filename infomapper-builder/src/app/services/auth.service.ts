import { Injectable }             from '@angular/core';
import { Router }                 from '@angular/router';
import { ICredentials }           from '@aws-amplify/core';
import { Amplify,
          Auth,
          Storage }               from 'aws-amplify';

import { BehaviorSubject,
          concatMap,
          first,
          forkJoin,
          from,
          map,
          mergeMap,
          Observable, 
          of }                    from 'rxjs';
import { CognitoUser,
          CognitoUserSession }    from 'amazon-cognito-identity-js';

import { S3ProviderListConfig }   from '@aws-amplify/storage/lib-esm/types';
import { ParamAccount }           from '../infomapper-builder-types';
import { LocalStorageService }    from './local-storage.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * 
   */
  private _authUsername = new BehaviorSubject<string>('');
  /**
   * 
   */
  private _amplify: any;
  /** Used for determining whether the current user is authenticated from the
   * Cognito User Pool. */
  private _userAuthenticated = new BehaviorSubject<boolean>(false);
  /**
   * 
   */
  private _cognitoCredentials: ICredentials;
  /**
   * 
   */
  private _cognitoSession: CognitoUserSession;
  /**
   * 
   */
  private _cognitoUser: CognitoUser;
  /**
   * 
   */
  private _currentUserParam: ParamAccount;
  /**
   * 
   */
  private readonly identityPoolId = 'us-west-2:c02c3e7e-a265-4c35-b2ff-d2bce1e33f8a'
  /**
   * 
   */
  private readonly appClientId = '2nd68j4v2dp114bp72e2vs9cv4';
  /** This is required, as Amazon will add the default 'public/', 'protected/',
   * or 'private/' prefixes in the URL. Since OWF is not using those folder names
   * in any S3 bucket, a custom empty string must be used as the prefix. */
  private storageOptions: S3ProviderListConfig = {
    pageSize: 'ALL',
    customPrefix: {
      public: '',
      protected: '',
      private: ''
    }
  };


  /**
   * Constructor the AuthService. Configures the Amplify class with the Cognito
   * User Pool Id and the User Pool web client Id.
   */
  constructor(private router: Router, private storageService: LocalStorageService) {

    this._amplify = Amplify.configure({
      Auth: {
        identityPoolId: this.identityPoolId,
        region: 'us-west-2',
        userPoolId: 'us-west-2_oIuEME4cI',
        userPoolWebClientId: this.appClientId
      }
    });

  }

  /**
   * 
   */
  get amplify(): any {
    return this._amplify;
  }

  /**
   * 
   */
  get authUsername$(): Observable<string> {
    return this._authUsername.asObservable();
  }

  /**
   * 
   */
  get cognitoCredentials(): ICredentials {
    return this._cognitoCredentials;
  }

  /**
   * 
   */
  get cognitoUser(): CognitoUser {
    return this._cognitoUser;
  }

  /**
   * Getter for the user authentication. Will be true if the user is authenticated.
   * @returns A BehaviorSubject of type boolean as an observable.
   */
  get userAuthenticated$(): Observable<boolean> {
    return this._userAuthenticated.asObservable();
  }

  /**
   * Setter for the _userAuthenticated variable to the passed in boolean value.
   */
  set userAuthenticated(verified: boolean) {
    this._userAuthenticated.next(verified);
  }

  /**
   * 
   * @param currentPassword 
   * @param newPassword 
   */
  getAllCredentials(): Observable<any> {

    return forkJoin({
      session: this.getCurrentSession(),
      credentials: this.getCurrentCredentials()
    });

  }

  /**
   * Use the AWS Amplify 'Storage' class to list the files under the provided path
   * given from the user's Parameter from the Systems Manager Parameter store.
   * @returns A Promise converted to an Observable for subscription to obtain the
   * necessary S3 files and folders.
   */
  getAllBucketFiles(): Observable<any> {
    // TODO: jpkeahey - Make this dynamic. Using something like 'latest/assets/'
    // will only let the user see those folders and not others.
    return from(
      Storage.list(this._currentUserParam.values.accountPath, this.storageOptions)
      .then((result: any) => { return result; })
      .catch((err: any) => { return err; })
    );
  }

  /**
   * 
   * @returns 
   */
  getCurrentCredentials(): Observable<ICredentials> {
    return from(
      Auth.currentCredentials()
      .then((result: any) => { return result; })
      .catch((err: any) => { return err; })
    )
  }

  /**
   * 
   * @returns 
   */
  getCurrentSession(): Observable<CognitoUserSession> {
    return from(
      Auth.currentSession()
      .then((result: any) => { return result; })
      .catch((err: any) => { return err; })
    )
  }

  /**
   * 
   * @param filePath 
   * @returns 
   */
  getFileSourcePath(filePath: string): Observable<any> {
    return from(
      Storage.get(filePath, {
        customPrefix: {
          public: '',
          protected: '',
          private: ''
        }
      })
      .then((result: any) => { return result; })
      .catch((err: any) => { return err; })
    );
  }

  /**
   * Uses the AuthClass currentAuthenticatedUser to check if the current user has
   * an active session.
   * @returns An observable true if the user is authenticated, and false if not.
   */
  isUserLoggedIn(): Observable<boolean> {
    return from(Auth.currentAuthenticatedUser().catch(() => {
      // User is unauthenticated. The currentAuthenticatedUser promise throws an
      // error, so catch it here and return undefined so the observable can perform
      // the correct action.
      return undefined;
    })).pipe(
      map((user: CognitoUser) => {
        if (user) {
          this.successfulAuthCheckSetup(user);
          return true;
        } else {
          return false;
        }
      }),
      first()
      );
  }

  /**
   * Attempts to sign-in the user with the provided credentials, and returns the
   * response as a Promise converted to an Observable.
   * @param userNameOrEmail The username or email entered by the user.
   * @param password The password to be entered.
   * @returns An observable response to the authentication request.
   */
  signIn(userNameOrEmail: string, password: string, serviceAccount?: boolean): Observable<CognitoUser | any> {
    console.log('CURRENT ACCOUNT PARAM:', this.storageService.getUserParamAccount());
    console.log('Service Account:', serviceAccount);

    if (serviceAccount) {
      return from(Auth.signIn(userNameOrEmail, password));
    }

    // Configure Amplify with the necessary data for this user.
    Amplify.configure({
      Auth: {
        identityPoolId: this.identityPoolId,
        region: 'us-west-2',
        userPoolId: this.storageService.getUserParamAccount().values.userPoolId,
        userPoolWebClientId: this.storageService.getUserParamAccount().values.userPoolClientId
      },
      Storage: {
        AWSS3: {
          bucket: 'test.openwaterfoundation.org',
          region: 'us-west-2',
          level: 'public'
        }
      }
    });
    return from(Auth.signIn(userNameOrEmail, password));
  }

  /**
   * Signs the user out of the session.
   * @returns An observable of the response from Cognito upon sign out.
   */
  signOut(serviceAccount?: boolean): void {
    from(Auth.signOut()).pipe(first()).subscribe(() => {
      // Logging out of a service account does not need to do anything else.
      if (!serviceAccount) {
        this._authUsername.next('');
        this._userAuthenticated.next(false);
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Called every page navigation and page refresh if the user is still logged in.
   * @param cognitoUser The user object returned when successfully signed in.
   */
  successfulAuthCheckSetup(cognitoUser: CognitoUser): void {
    this._cognitoUser = cognitoUser;
    this._authUsername.next(this._cognitoUser.getUsername());
    this.userAuthenticated = true;
  }

  /**
   * Sets necessary attributes upon successful user login on the sign in page.
   * @param cognitoUser The user object returned when successfully signed in.
   */
  successfulLoginSetup(cognitoUser: CognitoUser): void {

    this._authUsername.next(cognitoUser.getUsername());
    this._cognitoUser = cognitoUser;

    this.userAuthenticated = true;
    this.router.navigate(['/content-page/home']);
  }

  /**
   * Attempts to sign-in the user with the provided credentials, and returns the
   * response as a Promise converted to an Observable.
   * @param userNameOrEmail The username or email entered by the user.
   * @param password The password to be entered.
   * @returns An observable response to the authentication request.
   */
  x_signInTest(userNameOrEmail: string, password: string): Observable<any> {

    return from(Auth.signIn(userNameOrEmail, password)).pipe(
      concatMap((cognitoUser: CognitoUser) => {
        this._cognitoUser = cognitoUser;
        return this.getCurrentCredentials();
      }),
      mergeMap((currentCredentials: ICredentials) => {
        this._cognitoCredentials = currentCredentials;
        return this.getCurrentSession();
      }),
      mergeMap((currentSession: CognitoUserSession) => {
        this._cognitoSession = currentSession;
        return of('Sign in success.');
      }));
  }
  
}
