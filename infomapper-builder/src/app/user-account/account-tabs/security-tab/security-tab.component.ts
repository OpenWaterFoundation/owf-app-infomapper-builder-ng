import { Component,
          OnInit }                from '@angular/core';
import { AbstractControl,
          FormControl,
          FormGroup, 
          Validators }            from '@angular/forms';
import { ICredentials }           from '@aws-amplify/core';
import { CognitoIdentityProviderClient,
          ChangePasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import { CognitoUserSession }     from 'amazon-cognito-identity-js';
import { first }                  from 'rxjs';
import { AuthService }            from 'src/app/services/auth.service';


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
  /** FormGroup used by the SecurityTabComponent for changing a user password. */
  securityTabFG = new FormGroup({
    currentPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', Validators.required),
    confirmNewPassword: new FormControl('', Validators.required)
  });


  /**
   * 
   */
  constructor(private authService: AuthService) { }
  

  /**
   * @returns A boolean of whether the new password and confirm new password fields
   * are equal to each other.
   */
  arePasswordsEqual(): boolean {
    return this.securityTabFG.get('newPassword').value === this.securityTabFG.get('confirmNewPassword').value
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
   * 
   * @param client 
   * @param command 
   */
  private async updatePassword(client: CognitoIdentityProviderClient, command: ChangePasswordCommand) {
    const response = client.send(command);
    console.log('Password change response:', response);
  }

}
