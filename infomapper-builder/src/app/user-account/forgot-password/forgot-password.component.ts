import { Component,
          OnInit }                      from '@angular/core';
import { AbstractControl,
          FormControl,
          FormGroup,
          Validators }                  from '@angular/forms';
import { MatSnackBar,
          MatSnackBarHorizontalPosition,
          MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ICredentials }                 from '@aws-amplify/core';
import { CodeMismatchException, CognitoIdentityProviderClient,
          ConfirmForgotPasswordCommand,
          ConfirmForgotPasswordCommandOutput,
          ForgotPasswordCommand, 
          ForgotPasswordCommandOutput, 
          InvalidParameterException,
          LimitExceededException} from "@aws-sdk/client-cognito-identity-provider";

import { faEye,
          faEyeSlash }                  from '@fortawesome/free-solid-svg-icons';
import { first }                        from 'rxjs';
import { AuthService }                  from 'src/app/services/auth.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  /** The Cognito Identity Provider Client from the AWS SDK. Sends commands that deal
   * with user accounts in a User Pool. */
  cognitoIdPClient: CognitoIdentityProviderClient;
  /** FormGroup used by the SecurityTabComponent for changing a user password. */
  forgotPasswordFG = new FormGroup({
    username: new FormControl('', Validators.required),
    newPassword: new FormControl('', Validators.required),
    verificationCode: new FormControl('', Validators.required)
  });
  /** The custom & built-in error messages to be displayed under a form with an error. */
  formErrorMessages = {
    required: 'Required'
  };
  /** First form to be shown before password recovery email is sent. */
  initialRecovery = true;
  /** How many milliseconds the error snackbar will be displayed for. */
  snackBarDuration = 5000;
  /** Sets the horizontal position of the error snackbar to display on the right
   * side of the screen. */
  snackBarHPos: MatSnackBarHorizontalPosition = 'center';
  /** Sets the vertical position of the error snackbar to display at the top of
  * the screen. */
  snackBarVPos: MatSnackBarVerticalPosition = 'top';
  /** Font Awesome icon used to display at the end of the password input field. */
  visibilityIcon = faEye;
  /** Boolean set to whether the password input field is visible or 'hidden'. */
  visibleInput = false;
  /** Dynamic tooltip to display over the password icon on mouse hover. */
  visibilityMessage = 'Show password';

  
  /**
   * 
   */
  constructor(private authService: AuthService, private snackBar: MatSnackBar,
  private router: Router) { }


  /**
   * Uses the ConfirmForgotPassword AWS SDK command with the provided verification
   * code to change a user's password.
   */
  async confirmRecoverPassword() {
    const verificationCode = this.forgotPasswordFG.get('verificationCode').value;
    const username = this.forgotPasswordFG.get('username').value;
    const newPassword = this.forgotPasswordFG.get('newPassword').value;

    const command = new ConfirmForgotPasswordCommand({
      ClientId: this.authService.appClientId,
      ConfirmationCode: verificationCode,
      Password: newPassword,
      Username: username
    });

    try {
      const response: ConfirmForgotPasswordCommandOutput = await this.cognitoIdPClient.send(command);

      this.snackBar.open('Password reset successful!', null, {
        duration: this.snackBarDuration,
        panelClass: 'snackbar-success',
        horizontalPosition: this.snackBarHPos,
        verticalPosition: this.snackBarVPos
      });

      this.router.navigate(['/login']);
    }
    catch (e) {
      console.log('ConfirmForgotPassword error:', e);

      this.snackBar.open(this.handleAWSError(e), null, {
        duration: this.snackBarDuration,
        panelClass: 'snackbar-error',
        horizontalPosition: this.snackBarHPos,
        verticalPosition: this.snackBarVPos
      });
    }
  }

  /**
   * @param control The FormControl that will be checked for errors.
   * @returns An array with all errors for the control, or an empty array of no errors.
   */
  formErrors(control: AbstractControl): string[] {
    return control.errors ? Object.keys(control.errors) : [];
  }

  /**
   * Handles common response errors from the AWS SDK.
   * @param e The response error returned from AWS.
   * @returns A string with a short description of what went wrong with the request.
   */
  handleAWSError(e: any): string {

    if (e instanceof CodeMismatchException) {
      return 'Verification code invalid. Please try again.';
    }
    else if (e instanceof InvalidParameterException) {
      console.log('Error message:', e.message);
      if (e.message.includes('Password not long enough')) {
        return 'Password must be at least 8 characters in length.';
      }
      else if (e.message.includes('uppercase characters')) {
        return 'Password must contain at least 1 uppercase letter.';
      }
      else if (e.message.includes('lowercase characters')) {
        return 'Password must contain at least 1 lowercase letter.';
      }
    }
    else if (e instanceof LimitExceededException) {
      return 'Attempt limit exceeded, please try again after some time.';
    }

    return 'Password reset error.';
  }

  /**
   * @returns A boolean of whether the newPassword FormControl is invalid or not.
   */
  isPasswordInvalid(): boolean {
    return this.forgotPasswordFG.get('newPassword').invalid;
  }

  /**
   * @returns A boolean of whether the username FormControl is invalid or not.
   */
  isUsernameInvalid(): boolean {
    return this.forgotPasswordFG.get('username').invalid;
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
   */
  ngOnInit(): void {
  }

  /**
   * Creates the Cognito client and builds the ForgotPassword command.
   */
  recoverPassword() {

    this.authService.getCurrentCredentials().pipe(first())
    .subscribe((cred: ICredentials) => {
      
      this.cognitoIdPClient = new CognitoIdentityProviderClient({
        region: "us-west-2",
        credentials: {
          accessKeyId: cred.accessKeyId,
          secretAccessKey: cred.secretAccessKey,
          sessionToken: cred.sessionToken,
          expiration: cred.expiration
        }
      });

      const userName = this.forgotPasswordFG.get('username').value;
  
      const command = new ForgotPasswordCommand({
        ClientId: this.authService.appClientId,
        Username: userName
      });
      
      this.sendForgotPasswordCommand(command);
    });
    
  }

  /**
   * Uses the previously built Cognito Identity Provided Client to send the
   * ForgotPasswordCommand.
   * @param command The ForgotPasswordCommand to send.
   */
  private async sendForgotPasswordCommand(command: ForgotPasswordCommand) {

    try {
      const response: ForgotPasswordCommandOutput = await this.cognitoIdPClient.send(command);
      this.snackBar.open('Verification email has been sent.', null, {
        duration: this.snackBarDuration,
        horizontalPosition: this.snackBarHPos,
        verticalPosition: this.snackBarVPos
      });

      // 'Move' to next forgot screen.
      this.initialRecovery = !this.initialRecovery;
    } catch (e) {
      console.log('ForgotPassword error:', e);
    }
    
  }

  /**
   * Toggles the password field's icon and tooltip message.
   */
  toggleIconVisibility(): void {

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
