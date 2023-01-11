import { Component,
          OnInit }                      from '@angular/core';
import { AbstractControl,
          FormControl,
          FormGroup, 
          Validators }                  from '@angular/forms';
import { MatSnackBar,
          MatSnackBarHorizontalPosition,
          MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

import { ICredentials }                 from '@aws-amplify/core';
import { CognitoIdentityProviderClient,
          ChangePasswordCommand, 
          ChangePasswordCommandOutput,
          NotAuthorizedException, 
          InvalidPasswordException}      from "@aws-sdk/client-cognito-identity-provider";
import { faEye,
          faEyeSlash }                  from '@fortawesome/free-solid-svg-icons';

import { CognitoUserSession }           from 'amazon-cognito-identity-js';
import { first }                        from 'rxjs';
import { AuthService }                  from 'src/app/services/auth.service';


@Component({
  selector: 'app-security-tab',
  templateUrl: './security-tab.component.html',
  styleUrls: ['./security-tab.component.scss', '../../../shared-styles.scss']
})
export class SecurityTabComponent implements OnInit {

  /** The custom & built-in error messages to be displayed under a form with an error. */
  formErrorMessages = {
    required: 'Required'
  };
  /** Sets the horizontal position of the error snackbar to display on the right
   * side of the screen. */
  snackBarHPos: MatSnackBarHorizontalPosition = 'center';
  /** Sets the vertical position of the error snackbar to display at the top of
  * the screen. */
  snackBarVPos: MatSnackBarVerticalPosition = 'top';
  /** FormGroup used by the SecurityTabComponent for changing a user password. */
  securityTabFG = new FormGroup({
    currentPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', Validators.required),
    confirmNewPassword: new FormControl('', Validators.required)
  });
  /** How many milliseconds the error snackbar will be displayed for. */
  snackBarDuration = 3000;
  /** Font Awesome icon used to display at the end of each password input field.
   * In the order Current Password, New Password, Confirm New Password. */
  visibilityIconCP = faEye;
  visibilityIconNP = faEye;
  visibilityIconCNP = faEye;
  /** Boolean set to whether the password input field is visible or 'hidden'. In
   * the order Current Password, New Password, Confirm New Password.*/
  visibleInputCP = false;
  visibleInputNP = false;
  visibleInputCNP = false;
  /** Dynamic tooltip to display over the password icon on mouse hover. In the order
   * Current Password, New Password, Confirm New Password. */
  visibilityMessageCP = 'Show password';
  visibilityMessageNP = 'Show password';
  visibilityMessageCNP = 'Show password';


  /**
   * 
   */
  constructor(private authService: AuthService, private snackBar: MatSnackBar) { }
  

  /**
   * @returns A boolean of whether the new password and confirm new password fields
   * are equal to each other.
   */
  arePasswordsEqual(): boolean {
    return this.securityTabFG.get('newPassword').value === this.securityTabFG.get('confirmNewPassword').value
  }

  /**
   * 
   */
  async createUpdatePasswordRequest() {

    const currentPassword = this.securityTabFG.get('currentPassword').value;
    const newPassword = this.securityTabFG.get('newPassword').value;

    this.authService.getAllCredentials().pipe(first()).subscribe({
      next: (cred: {session: CognitoUserSession, credentials: ICredentials}) => {

        const cognitoIdPClient = new CognitoIdentityProviderClient({
          region: "us-west-2",
          credentials: {
            accessKeyId: cred.credentials.accessKeyId,
            secretAccessKey: cred.credentials.secretAccessKey,
            sessionToken: cred.credentials.sessionToken,
            expiration: cred.credentials.expiration
          }
        });

        const command = new ChangePasswordCommand({
          AccessToken: cred.session.getAccessToken().getJwtToken(),
          PreviousPassword: currentPassword,
          ProposedPassword: newPassword
        });

        this.updatePassword(cognitoIdPClient, command);
      }
    });

  }

  /**
   * @param control The FormControl that will be checked for errors.
   * @returns An array with all errors for the control, or an empty array of no errors.
   */
  formErrors(control: AbstractControl): string[] {
    return control.errors ? Object.keys(control.errors) : [];
  }

  /**
   * Determines if the securityTab FormGroup is invalid or the `new` and `confirm new`
   * passwords fields are not equal.
   * @returns A boolean of whether the Update Password button is disabled.
   */
  isUpdatePasswordDisabled(): boolean {
    return ((this.securityTabFG.invalid) || (!this.arePasswordsEqual()))
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
   */
  ngOnInit(): void {
  }

  /**
  * Displays the self-closing error message so users know what went wrong.
  */
  openErrorSnackBar(errorMessage: string) {
    this.snackBar.open(errorMessage, null, {
      duration: this.snackBarDuration,
      panelClass: 'snackbar-error',
      horizontalPosition: this.snackBarHPos,
      verticalPosition: this.snackBarVPos
    });
  }

  /**
  * Displays the self-closing error message so users know what went wrong.
  */
  openSuccessSnackBar() {
    this.snackBar.open('New password successfully saved.', null, {
      duration: this.snackBarDuration,
      panelClass: 'snackbar-success',
      horizontalPosition: this.snackBarHPos,
      verticalPosition: this.snackBarVPos
    });
  }

  /**
   * 
   */
  passwordChangeSuccessful(): void {
    // 1. Reset each password input field to an empty string.
    this.securityTabFG.get('currentPassword').reset('');
    this.securityTabFG.get('newPassword').reset('');
    this.securityTabFG.get('confirmNewPassword').reset('');
    // 2. Open the successful 
    this.openSuccessSnackBar();
  }

  /**
   * Toggles the password field's icon and tooltip message.
   */
  toggleIconVisibility(inputType: string): void {

    if (inputType === 'CP') {
      this.visibleInputCP = !this.visibleInputCP;

      if (this.visibilityIconCP === faEye) {
        this.visibilityIconCP = faEyeSlash
      } else {
        this.visibilityIconCP = faEye;
      }
      if (this.visibilityMessageCP === 'Show password') {
        this.visibilityMessageCP = 'Hide password';
      } else {
        this.visibilityMessageCP = 'Show password';
      }
    }
    else if (inputType === 'NP') {
      this.visibleInputNP = !this.visibleInputNP;

      if (this.visibilityIconNP === faEye) {
        this.visibilityIconNP = faEyeSlash
      } else {
        this.visibilityIconNP = faEye;
      }
      if (this.visibilityMessageNP === 'Show password') {
        this.visibilityMessageNP = 'Hide password';
      } else {
        this.visibilityMessageNP = 'Show password';
      }
    }
    else if (inputType === 'CNP') {
      this.visibleInputCNP = !this.visibleInputCNP;

      if (this.visibilityIconCNP === faEye) {
        this.visibilityIconCNP = faEyeSlash
      } else {
        this.visibilityIconCNP = faEye;
      }
      if (this.visibilityMessageCNP === 'Show password') {
        this.visibilityMessageCNP = 'Hide password';
      } else {
        this.visibilityMessageCNP = 'Show password';
      }
    }
  }

  /**
   * 
   * @param client 
   * @param command 
   */
  private async updatePassword(client: CognitoIdentityProviderClient, command: ChangePasswordCommand) {
    const response = client.send(command);

    response.then(
      (result: ChangePasswordCommandOutput) => {
        this.passwordChangeSuccessful();
      },
      (error: any) => {
        var errorMessage = 'Password update error. Contact OWF.';

        if (error instanceof NotAuthorizedException) {
          errorMessage = 'Current password incorrect. Please try again.';
        } else if (error instanceof InvalidPasswordException) {
          console.log('Message:', error.message);
          if (error.message.includes('Password not long enough')) {
            errorMessage = 'New password must be at least 8 characters.';
          }
        } else {
          console.log(error);
        }

        this.openErrorSnackBar(errorMessage);
      }
    )
  }

}
