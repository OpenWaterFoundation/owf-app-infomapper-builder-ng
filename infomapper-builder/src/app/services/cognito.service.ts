import { Injectable } from '@angular/core';
import { Amplify, Auth } from 'aws-amplify';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CognitoService {

  private _userVerified = new BehaviorSubject<boolean>(false);


  constructor() {
    Amplify.configure({
      Auth: environment.cognito
    });
  }


  /**
   * 
   * @returns 
   */
   get userVerified(): Observable<boolean> {
    return this._userVerified.asObservable();
  }

  set setUserVerified(verified: boolean) {
    this._userVerified.next(verified);
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
