import { Component,
          Input,
          OnInit }                        from '@angular/core';
import { AbstractControl,
          FormControl,
          FormGroup,
          Validators }                    from '@angular/forms';

import { faEye,
          faEyeSlash }                    from '@fortawesome/free-solid-svg-icons';

import { AdminRespondToAuthChallengeCommand,
          AdminRespondToAuthChallengeCommandOutput,
          ChallengeNameType,
          CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { CognitoUserSession }             from 'amazon-cognito-identity-js';
import { AuthService } from 'src/app/services/auth.service';
import { ICredentials } from '@aws-amplify/core';
import { first } from 'rxjs';
import { LocalStorageService } from 'src/app/services/local-storage.service';


@Component({
  selector: 'confirm-account',
  templateUrl: './confirm-account.component.html',
  styleUrls: ['./confirm-account.component.scss']
})
export class ConfirmAccountComponent implements OnInit {


  /** The Identity Provider Client for Cognito User Pools. */
  cognitoIdPClient: CognitoIdentityProviderClient;
  /** The custom & built-in error messages to be displayed under a form with an error. */
  formErrorMessages = {
    required: 'Required'
  };
  /**
   * 
   */
  respondToAuthFG = new FormGroup({
    newPassword: new FormControl('', Validators.required),
    confirmNewPassword: new FormControl('', Validators.required)
  });
  /**
   * 
   */
  @Input('cognitoUser') cognitoUser: any;
  /** Font Awesome icon used to display at the end of the password input field. */
  visibilityIcon = faEye;
  /** Boolean set to whether the password input field is visible or 'hidden'. */
  visibleInput = false;
  /** Dynamic tooltip to display over the password icon on mouse hover. */
  visibilityMessage = 'Show password';


  /**
   * 
   */
  constructor(private authService: AuthService, private storageService: LocalStorageService) { }


  /**
   * @param control The FormControl that will be checked for errors.
   * @returns An array with all errors for the control, or an empty array of no errors.
   */
  formErrors(control: AbstractControl): string[] {
    return control.errors ? Object.keys(control.errors) : [];
  }

  ngOnInit(): void {

  }

  /**
   * 
   */
  resetPassword(): void {

    this.authService.getAllCredentials().pipe(first()).subscribe({
      next: (cred: {session: CognitoUserSession, credentials: ICredentials}) => {

        this.cognitoIdPClient = new CognitoIdentityProviderClient({
          region: "us-west-2",
          credentials: {
            accessKeyId: cred.credentials.accessKeyId,
            secretAccessKey: cred.credentials.secretAccessKey,
            sessionToken: cred.credentials.sessionToken,
            expiration: cred.credentials.expiration
          }
        });

        console.log('Credentials:', cred);

        const command = new AdminRespondToAuthChallengeCommand({
          ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
          ClientId: this.storageService.getUserParamAccount().values.userPoolClientId,
          ChallengeResponses: {
            "USERNAME": this.cognitoUser.getUsername(),
            "NEW_PASSWORD": this.respondToAuthFG.get('newPassword').value
          },
          UserPoolId: this.storageService.getUserParamAccount().values.userPoolId,
          Session: this.cognitoUser.Session
        });

        this.sendRespondToAuth(command);
      }
    });
  }

  /**
   * 
   * @returns 
   */
  resetPasswordDisabled(): boolean {
    return (
      (this.respondToAuthFG.invalid) ||
      (this.respondToAuthFG.get('newPassword').value !==
      this.respondToAuthFG.get('confirmNewPassword').value)
    );
  }

  /**
   * 
   * @param command 
   */
  private async sendRespondToAuth(command: AdminRespondToAuthChallengeCommand) {

    try {
      const response: AdminRespondToAuthChallengeCommandOutput = await this.cognitoIdPClient.send(command);
      console.log('RESPOND TO AUTH SUCCESSFUL:', response);
    }
    catch (e: any) {
      console.log('Error responding to auth challenge:', e);
    }
  }

  /**
   * Toggles the password field's icon and tooltip message.
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
