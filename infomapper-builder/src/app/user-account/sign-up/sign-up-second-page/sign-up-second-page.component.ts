import { Component,
          Input,
          OnInit }                from '@angular/core';
import { ICredentials } from '@aws-amplify/core';
import { CognitoIdentityProviderClient,
          CreateUserPoolCommand } from "@aws-sdk/client-cognito-identity-provider";
import { CreateActivationCommandOutput } from '@aws-sdk/client-ssm';
import { CognitoUserSession }    from 'amazon-cognito-identity-js';
import { first } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'sign-up-second-page',
  templateUrl: './sign-up-second-page.component.html',
  styleUrls: ['./sign-up-second-page.component.scss']
})
export class SignUpSecondPageComponent implements OnInit {

  @Input('accountType') accountType: string;


  constructor(private authService: AuthService) { }


  private createUserPool(): void {

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

        const command = new CreateUserPoolCommand({
          PoolName: 'user-pool-test'
        });

        this.sendCreateUserPool(cognitoIdPClient, command);
      }
    });
  }

  /**
   * 
   */
  ngOnInit(): void {
    console.log('Account type:', this.accountType);

    // Make sure to sign into service account.
    // this.createUserPool();
  }

  async sendCreateUserPool(client: CognitoIdentityProviderClient, command: CreateUserPoolCommand) {

    try {
      const response: CreateActivationCommandOutput = await client.send(command);
      console.log('User Pool created:', response);
    }
    catch (e: any) {
      console.log('Error creating User Pool:', e);
    }
  }

}
