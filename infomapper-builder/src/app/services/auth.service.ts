import { Injectable }            from '@angular/core';
import { Amplify,
          Auth,
          Storage }              from 'aws-amplify';
import { BehaviorSubject,
          combineLatest,
          first,
          from,
          Observable }           from 'rxjs';
import { CognitoUser,
          CognitoUserSession }   from 'amazon-cognito-identity-js';
import { ICredentials }          from 'node_modules/aws-amplify/src/Common/types/types';

import { Router }                from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _authUsername = new BehaviorSubject<string>('');
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
  readonly storageOptions = {
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
    Amplify.configure({
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

    // Determine if the user has already been logged in.
    from(Auth.currentAuthenticatedUser()).pipe(first()).subscribe({
      next: (user: CognitoUser) => {
        this._cognitoUser = user;
      }
    });
  }

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
  set setUserAuthenticated(verified: boolean) {
    this._userAuthenticated.next(verified);
  }

  /**
   * Attempts to sign-in the user with the provided credentials, and........
   * @param userNameOrEmail The username or email entered by the user.
   * @param pw The password to be entered.
   * @returns An observable response to the authentication request.
   */
  signIn(userNameOrEmail: string, pw: string): Observable<CognitoUser | any> {
    return from(Auth.signIn(userNameOrEmail, pw));
  }

  /**
   * Signs the user out of the session.
   * @returns An observable of the response from Cognito upon sign out.
   */
  signOut(): Observable<any> {
    return from(Auth.signOut());
  }

  /**
   * 
   * @returns 
   */
  listAllBucketFiles(): Observable<any> {
    return from(
      Storage.list('', this.storageOptions)
      .then((result: any) => { return result; })
      .catch((err: any) => { return err; })
    );

    // return from(
    //   Storage.get('4.0.0/assets/app-default/app-config.json', {
    //     customPrefix: {
    //       public: '',
    //       protected: '',
    //       private: ''
    //     }
    //   })
    //   .then((result: any) => { return result; })
    //   .catch((err: any) => { return err; })
    // );
  }

  /**
   * 
   * @param cognitoUser 
   */
  initLogin(cognitoUser?: CognitoUser): void {

    if (!cognitoUser) {
      this._authUsername.next(this._cognitoUser.getUsername());
    } else {
      this._authUsername.next(cognitoUser.getUsername());
      this.cognitoUser = cognitoUser;
    }

    this.setUserAuthenticated = true;
    this.router.navigate(['/content-page/home']);

    // const allSources = [from(Auth.currentSession()), from(Auth.currentCredentials())];

    // combineLatest(allSources).pipe(first())
    // .subscribe((
    //   [currentSession, currentCredentials]: [CognitoUserSession, ICredentials]) => {
      
    //   console.log('currentSession:', currentSession);
    //   console.log('currentCredentials:', currentCredentials);
    //   console.log('user:', cognitoUser);

    //   try {
    //     console.log(window.location.href.split('/')[2].split(':')[0]);
    //   } catch {
    //     console.log('Domain did not work.');
    //   }

    //   const opt: CookieOptions = {
    //     sameSite: "lax"
    //   };
    //   // this.cookieService.putObject('currentSession', currentSession, opt);
    //   this.cookieService.putObject('currentCredentials', currentCredentials, opt);
    //   // this.cookieService.putObject('cognitoUser', cognitoUser, opt);
    // });
  }

  /**
   * 
   * @returns 
   */
  alreadyLoggedIn(): Observable<boolean> {
    return from(
      Auth.currentAuthenticatedUser()
      .then((user: CognitoUser) => {
        if (user) {
          return true;
        } else {
          return false
        }
      })
      .catch((err: any) => {
        console.log('Error:', err);
        return false;
      })
    );
  }
  
}
