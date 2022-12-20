import { Injectable }           from '@angular/core';
import { Router }               from '@angular/router';
import { Amplify,
          Auth,
          Storage }             from 'aws-amplify';

import { BehaviorSubject,
          catchError,
          first,
          from,
          map,
          Observable, 
          of, 
          throwError}          from 'rxjs';
import { CognitoUser }          from 'amazon-cognito-identity-js';

import { S3ProviderListConfig } from '@aws-amplify/storage/lib-esm/types';



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
  /**
   * Used for determining whether the current user is authenticated from the
   * Cognito User Pool.
   */
  private _userAuthenticated = new BehaviorSubject<boolean>(false);
  /**
   * 
   */
  private _cognitoUser: CognitoUser;
  /**
   * This is required, as Amazon will add the default 'public/', 'protected/',
   * or 'private/' prefixes in the URL. Since OWF is not using those folder names
   * in any S3 bucket, a custom empty string must be used as the prefix 
   */
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
  constructor(private router: Router) {

    this._amplify = Amplify.configure({
      Auth: {
        identityPoolId: 'us-west-2:c02c3e7e-a265-4c35-b2ff-d2bce1e33f8a',
        region: 'us-west-2',
        userPoolId: 'us-west-2_oIuEME4cI',
        userPoolWebClientId: '2nd68j4v2dp114bp72e2vs9cv4'
      },
      Storage: {
        AWSS3: {
          bucket: 'test.openwaterfoundation.org',
          region: 'us-west-2',
          level: 'public'
        }
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
  get cognitoUser(): CognitoUser {
    return this._cognitoUser;
  }

  /**
   * 
   */
  set cognitoUser(cognitoUser: CognitoUser) {
    this._cognitoUser = cognitoUser;
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
   * @returns 
   */
  getAllBucketFiles(): Observable<any> {
  
    return from(
      Storage.list('', this.storageOptions)
      .then((result: any) => { return result; })
      .catch((err: any) => { return err; })
    );
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
   * Attempts to sign-in the user with the provided credentials, and........
   * @param userNameOrEmail The username or email entered by the user.
   * @param password The password to be entered.
   * @returns An observable response to the authentication request.
   */
  signIn(userNameOrEmail: string, password: string): Observable<CognitoUser | any> {
    return from(Auth.signIn(userNameOrEmail, password));
  }

  /**
   * Signs the user out of the session.
   * @returns An observable of the response from Cognito upon sign out.
   */
  signOut(): void {
    from(Auth.signOut()).pipe(first()).subscribe(() => {
      this._authUsername.next('');
      this._userAuthenticated.next(false);
      this.router.navigate(['/login']);
    });
  }

  /**
   * 
   */
  successfulAuthCheckSetup(cognitoUser: CognitoUser): void {
    this._cognitoUser = cognitoUser;
    this._authUsername.next(this._cognitoUser.getUsername());
    this.userAuthenticated = true;
  }

  /**
   * Sets
   * @param cognitoUser 
   */
  successfulLoginSetup(cognitoUser: CognitoUser): void {

    this._authUsername.next(cognitoUser.getUsername());
    this._cognitoUser = cognitoUser;


    this.userAuthenticated = true;
    this.router.navigate(['/content-page/home']);
  }
  
}
