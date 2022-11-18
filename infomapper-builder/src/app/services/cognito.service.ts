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


@Injectable({
  providedIn: 'root'
})
export class CognitoService {

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
   * and 'private/' prefixes in the URL. Since OWF is not using those folder names
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
   * Constructor the CognitoService. Configures the Amplify class with the Cognito
   * User Pool Id and the User Pool web client Id.
   */
  constructor() {
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
    // return from(
    //   Storage.list('4.0.0/assets/app-default/app-config.json', this.storageOptions)
    //   .then((result: any) => { return result; })
    //   .catch((err: any) => { return err; })
    // );

    return from(
      Storage.get('4.0.0/assets/app-default/app-config.json', {
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
   * 
   * @param user 
   */
  loginSuccessful(user: CognitoUser): void {

    const allSources = [
      from(Auth.currentSession()),
      from(Auth.currentUserInfo()),
      from(Auth.currentAuthenticatedUser()),
      from(Auth.currentUserCredentials())
    ]

    combineLatest(allSources).pipe(first())
    .subscribe(([currentSession, currentUserInfo, currentAuthenticatedUser, currentUserCredentials]:
    [CognitoUserSession, any, CognitoUser, ICredentials]) => {
      
      console.log('currentSession:', currentSession);
      console.log('currentUserInfo:', currentUserInfo);
      console.log('currentAuthenticatedUser:', currentAuthenticatedUser);
      console.log('currentUserCredentials:', currentUserCredentials);
    });
    this.setUserAuthenticated = true;
    this.cognitoUser = user;

  }
  
}
