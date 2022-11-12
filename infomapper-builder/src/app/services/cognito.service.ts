import { Injectable }    from '@angular/core';
import { Amplify,
          Auth,
          Storage }         from 'aws-amplify';
import { BehaviorSubject,
          from,
          Observable }   from 'rxjs';
import { environment }   from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CognitoService {

  /**
   * Used for determining whether the current user is authenticated from the
   * Cognito User Pool.
   */
  private _userAuthenticated = new BehaviorSubject<boolean>(false);

  private _cognitoUser: any = {};


  /**
   * Constructor the CognitoService. Configures the Amplify class with the Cognito
   * User Pool Id and the User Pool web client Id.
   */
  constructor() {
    Amplify.configure({
      Auth: environment.cognito,
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
  listAllBucketFiles(): any {
    // let currentSession = from(Auth.currentSession());
    // let currentUserInfo = from(Auth.currentUserInfo());
    // let currentAuthenticatedUser = from(Auth.currentAuthenticatedUser());
    // let currentUserCredentials = from(Auth.currentUserCredentials());
    // return combineLatest([currentSession, currentUserInfo,
    // currentAuthenticatedUser, currentUserCredentials]);

    // return from(Auth.currentSession());
    // return from(Auth.currentUserInfo());
    // return from(Storage.list(''));

    // return from(Auth.currentUserCredentials()
    // .then((currentUserCredentials: any) => {
    //   console.log('currentUserCredentials:', currentUserCredentials);
    //   Storage.list('').then((allFiles: any) => {
    //     console.log('All files (service):', allFiles);
    //     return allFiles
    //   });
    // }));

    Storage.list('')
    .then((result: any) => {
      console.log('result:', result);
    })
    .catch((err: any) => console.log('error:', err));
  }
  
}
