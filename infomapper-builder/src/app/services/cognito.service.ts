import { Injectable }    from '@angular/core';
import { Amplify,
          Auth }         from 'aws-amplify';
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


  /**
   * Constructor the CognitoService. Configures the Amplify class with the Cognito
   * User Pool Id and the User Pool web client Id.
   */
  constructor() {
    Amplify.configure({
      Auth: environment.cognito
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

  
}
