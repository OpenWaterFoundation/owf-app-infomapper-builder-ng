import { Injectable }    from '@angular/core';
import { Amplify,
          Auth,
          Storage }         from 'aws-amplify';
import { BehaviorSubject,
          from,
          Observable }   from 'rxjs';


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
  private _cognitoUser: any = {};
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
    },
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
  get cognitoUser(): any {
    return this._cognitoUser;
  }

  /**
   * 
   */
  set cognitoUser(cognitoUser: any) {
    this._cognitoUser = cognitoUser;
  }

  /**
   * Attempts to sign-in the user with the provided credentials, and........
   * @param userNameOrEmail The username or email entered by the user.
   * @param pw The password to be entered.
   * @returns An observable response to the authentication request.
   */
  signIn(userNameOrEmail: string, pw: string): Observable<any> {
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
    // let currentSession = from(Auth.currentSession());
    // let currentUserInfo = from(Auth.currentUserInfo());
    // let currentAuthenticatedUser = from(Auth.currentAuthenticatedUser());
    // let currentUserCredentials = from(Auth.currentUserCredentials());

    return from(
      Storage.list('', this.storageOptions)
      .then((result: any) => { return result; })
      .catch((err: any) => { return err; })
    );
    
  }
  
}
