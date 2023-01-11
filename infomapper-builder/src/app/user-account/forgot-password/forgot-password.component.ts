import { Component,
          OnInit }                      from '@angular/core';
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

  
  /**
   * 
   */
  constructor(private authService: AuthService) { }

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

      console.log();
      console.log();
  
      // const command = new ForgotPasswordCommand({ ClientId: '', Username: '' });
      
      // this.sendForgotPasswordCommand(cognitoIdPClient, command);
    });
    
  }

  private async sendForgotPasswordCommand(client: CognitoIdentityProviderClient, command: ForgotPasswordCommand) {

    const response: ForgotPasswordCommandOutput = await client.send(command);
  }

}
