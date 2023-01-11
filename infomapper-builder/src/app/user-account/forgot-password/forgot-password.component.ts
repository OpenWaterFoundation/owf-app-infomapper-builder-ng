import { Component,
          OnInit }                      from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ICredentials }                 from '@aws-amplify/core';

import { CognitoIdentityProviderClient,
          ForgotPasswordCommand, 
          ForgotPasswordCommandOutput } from "@aws-sdk/client-cognito-identity-provider";
import { first } from 'rxjs';
import { AuthService }                  from 'src/app/services/auth.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  /** FormGroup used by the SecurityTabComponent for changing a user password. */
  forgotPasswordFG = new FormGroup({
    username: new FormControl('', Validators.required)
  });
  /** The custom & built-in error messages to be displayed under a form with an error. */
  formErrorMessages = {
    required: 'Required'
  };

  
  /**
   * 
   */
  constructor(private authService: AuthService) { }


  /**
   * @param control The FormControl that will be checked for errors.
   * @returns An array with all errors for the control, or an empty array of no errors.
   */
  formErrors(control: AbstractControl): string[] {
    return control.errors ? Object.keys(control.errors) : [];
  }

  /**
   * 
   * @returns 
   */
  isFormInvalid(): boolean {
    return this.forgotPasswordFG.invalid;
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
  recoverPassword() {

    this.authService.getCurrentCredentials().pipe(first())
    .subscribe((cred: ICredentials) => {
      console.log('Current user credentials:', cred);
      
      const cognitoIdPClient = new CognitoIdentityProviderClient({
        region: "us-west-2",
        credentials: {
          accessKeyId: cred.accessKeyId,
          secretAccessKey: cred.secretAccessKey,
          sessionToken: cred.sessionToken,
          expiration: cred.expiration
        }
      });

  
      // const command = new ForgotPasswordCommand({ ClientId: '', Username: '' });
      
      // this.sendForgotPasswordCommand(cognitoIdPClient, command);
    });
    
  }

  private async sendForgotPasswordCommand(client: CognitoIdentityProviderClient, command: ForgotPasswordCommand) {

    const response: ForgotPasswordCommandOutput = await client.send(command);
  }

}
