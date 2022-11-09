import { Injectable } from '@angular/core';
import { Amplify, Auth } from 'aws-amplify';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CognitoService {

  /**
   * 
   */
  private _userAuthenticated = new BehaviorSubject<boolean>(false);


  /**
   * 
   */
  constructor() {
    Amplify.configure({
      Auth: environment.cognito
    });
  }


  /**
   * 
   * @returns 
   */
   get userAuthenticated$(): Observable<any> {
    return this._userAuthenticated.asObservable();
  }

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
   * 
   * @returns 
   */
  signOut(): Observable<any> {
    return from(Auth.signOut());
  }

  
}
