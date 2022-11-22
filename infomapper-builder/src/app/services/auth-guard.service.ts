import { Injectable }                   from '@angular/core';
import { ActivatedRouteSnapshot,
          CanActivate,
          Router,
          RouterStateSnapshot }         from '@angular/router';

import { MatSnackBar,
          MatSnackBarHorizontalPosition,
          MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

import { first,
          map,
          Observable }                  from 'rxjs';
import { AuthService }                  from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  /** How many milliseconds the error snackbar will be displayed for. */
  snackBarDuration = 5000;
  /** Sets the horizontal position of the error snackbar to display on the right
   * side of the screen. */
  snackBarHorizontalPos: MatSnackBarHorizontalPosition = 'end';
  /** Sets the vertical position of the error snackbar to display at the top of
  * the screen. */
  snackbarVerticalPos: MatSnackBarVerticalPosition = 'top';


  /**
   * 
   * @param authService 
   * @param router A service that provides navigation among views and URL manipulation
   * capabilities.
   */
  constructor(private authService: AuthService, private router: Router,
  private snackBar: MatSnackBar) { }

  
  /**
   * A CanActivate function that uses the Cognito service to determine if the user
   * has been authenticated and has access to the requested component.
   * @param route Snapshot of the current route.
   * @param state Snapshot of the current route state.
   * @returns An observable of type boolean if the user is authenticated.
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.userAuthenticated$.pipe(
      map((authenticated: boolean) => {

        // TODO: Don't display the snack bar initially.
        if (authenticated) {
          return true;
        } else {
          this.openErrorSnackBar();
          this.router.navigate(['']);
        }
      }),
      first()
    )
  }

  /**
  * Displays the self-closing error message so users know what went wrong.
  */
  openErrorSnackBar() {
    this.snackBar.open('Log in to use InfoMapper Builder functionality. ', null, {
      duration: this.snackBarDuration,
      panelClass: 'snackbar-warning',
      horizontalPosition: this.snackBarHorizontalPos,
      verticalPosition: this.snackbarVerticalPos
    });
  }

}
