import { Component,
          OnInit }                      from '@angular/core';
import { AbstractControl,
          FormControl,
          FormGroup,
          Validators }                  from '@angular/forms';
import { Router }                       from '@angular/router';

import { MatSnackBar,
          MatSnackBarHorizontalPosition,
          MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

import { faEye,
          faEyeSlash }                  from '@fortawesome/free-solid-svg-icons';
import { first,
          Subject,
          takeUntil }                   from 'rxjs';
import { CognitoService }               from '../services/cognito.service';

@Component({
  selector: 'im-builder-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss', '../shared-styles.scss']
})
export class SignInComponent implements OnInit {

  /** Subject that is completed when this component is destroyed. */
  destroyed = new Subject<void>();
  /** All used FontAwesome icons in the DialogComponent. */
  
  /** The custom & built-in error messages to be displayed under a form with an error. */
  formErrorMessages = {
    required: 'Required'
  }
  /**
   * 
   */
  signInFG = new FormGroup({
    user: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });
  /** How many milliseconds the error snackbar will be displayed for. */
  snackBarDuration = 5000;
  /** Sets the horizontal position of the error snackbar to display on the right
   * side of the screen. */
  snackBarHorizontalPos: MatSnackBarHorizontalPosition = 'end';
  /** Sets the vertical position of the error snackbar to display at the top of
  * the screen. */
  snackbarVerticalPos: MatSnackBarVerticalPosition = 'top';
  /** Font Awesome icon used to display at the end of the password input field. */
  visibilityIcon = faEye;
  /** Boolean set to whether the password input field is visible or 'hidden'. */
  visibleInput = false;
  /** Dynamic tooltip to display over the password icon on mouse hover. */
  visibilityMessage = 'Show password';
  

  /**
   * 
   */
  constructor(private cognitoService: CognitoService, private router: Router,
  private snackBar: MatSnackBar) {

  }


  /**
   * 
   * @param control The FormControl that will be checked for errors.
   * @returns An array with all errors for the control, or an empty array of no errors.
   */
  formErrors(control: AbstractControl): string[] {
    return control.errors ? Object.keys(control.errors) : [];
  }

  /**
   * 
   */
  ngOnInit(): void {
    // If the user is already authenticated, navigate  to the home page.
    this.cognitoService.userAuthenticated$.pipe(first()).subscribe((authenticated: boolean) => {
      // console.log('User authenticated after sign in component init:', authenticated);

      if (authenticated) {
        this.router.navigate(['/content-page/home']);
      }
    })
  }

  /**
  * Called once right before this component is destroyed.
  */
   ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
  * Displays the self-closing error message so users know what went wrong.
  */
  openErrorSnackBar() {
    this.snackBar.open('Incorrect username/email or password. ', null, {
      duration: this.snackBarDuration,
      panelClass: 'snackbar-error',
      horizontalPosition: this.snackBarHorizontalPos,
      verticalPosition: this.snackbarVerticalPos
    });
  }

  /**
   * Utilizes the Cognito service to attempt to sign the user in with the provided
   * credentials. Shows the home page is successful, and an error snackbar
   */
  signInUser(): void {

    const usernameOrEmail = this.signInFG.get('user').value;
    const pw = this.signInFG.get('password').value;

    this.cognitoService.signIn(usernameOrEmail, pw)
    .pipe(takeUntil(this.destroyed))
    .subscribe({
      next: (response: any) => {
        console.log('Successful login response:', response);
        this.router.navigate(['/content-page/home']);
        this.cognitoService.setUserAuthenticated = true;
        this.cognitoService.cognitoUser = response;
      },
      error: (error: any) => {
        this.openErrorSnackBar();
      }
  });
  }

  /**
   * 
   */
  togglePasswordVisibility(): void {
    this.visibleInput = !this.visibleInput;

    if (this.visibilityIcon === faEye) {
      this.visibilityIcon = faEyeSlash
    } else {
      this.visibilityIcon = faEye;
    }
    if (this.visibilityMessage === 'Show password') {
      this.visibilityMessage = 'Hide password';
    } else {
      this.visibilityMessage = 'Show password';
    }
  }

}
