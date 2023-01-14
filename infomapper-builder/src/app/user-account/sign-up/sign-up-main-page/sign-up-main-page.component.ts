import { Component,
          OnInit }                       from '@angular/core';
import { FormControl,
          FormGroup }                    from '@angular/forms';
import { ICredentials }                  from '@aws-amplify/core';
import { AccountRecoverySettingType,
          CognitoIdentityProviderClient,
          CreateUserPoolCommand,
          CreateUserPoolCommandOutput,
          RecoveryOptionType,
          RecoveryOptionNameType, 
          AliasAttributeType,
          VerifiedAttributeType,
          CreateUserPoolClientCommand, 
          CreateUserPoolClientCommandOutput,
          DeletionProtectionType,
          ExplicitAuthFlowsType}  from "@aws-sdk/client-cognito-identity-provider";

import { first }                         from 'rxjs';
import { CognitoUser,
          CognitoUserSession }           from 'amazon-cognito-identity-js';
import { AuthService }                   from 'src/app/services/auth.service';

          
@Component({
  selector: 'app-sign-up-main',
  templateUrl: './sign-up-main-page.component.html',
  styleUrls: ['./sign-up-main-page.component.scss']
})
export class SignUpMainPageComponent implements OnInit {

  accountAddType: string;

  accountType: string;
  /** All InfoMapper account types. */
  readonly accountTypes = ['', 'Individual', 'Organization', 'Community'];
  /** The Form Group with both the existing and new account type Controls. Only one
   * will be chosen. */
  accountTypeFG = new FormGroup({
    existingAccountType: new FormControl(''),
    newAccountType: new FormControl('')
  });
  
  /**
   * 
   */
  cognitoIdPClient: CognitoIdentityProviderClient;
  /**
   * 
   */
  createNewAccountFG = new FormGroup({
    userPoolName: new FormControl('')
  });
  /** Name of the current create account 'page' to be shown to the user. Will consist
   * of 'first', 'second', ... , and end with 'last'. */
  currentPage: string;
  /** The index of the current page in the signUpPages array. */
  private currentPageIndex = 0;
  /** All 'pages' to be shown for creating a new account under the '/signup' app path. */
  private readonly signUpPages = ['first', 'second', 'third', 'fourth', 'last'];


  /**
   * The constructor for the SignUpMainPageComponent.
   */
  constructor(private authService: AuthService) {

    this.currentPage = this.signUpPages[this.currentPageIndex];
  }


  /**
   * 
   * @param accountType 
   * @param accountAddType
   */
  accountTypeChosen(accountType: string, accountAddType: string): void {
    this.accountType = accountType;
    this.accountAddType = accountAddType;
  }

  /**
   * 
   * @returns 
   */
  canProgress(): boolean {

    if (this.currentPage === 'first') {
      return !(this.accountTypeFG.get('existingAccountType').value ||
      this.accountTypeFG.get('newAccountType').value);
    } else if (this.currentPage == 'second') {
      return !(this.createNewAccountFG.get('userPoolName').value);
    }
    return false; // For now.
  }

  /**
   * 
   */
  private createUserPool(): void {

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

        const providedUserPoolName = this.createNewAccountFG.get('userPoolName').value.replace(/\s+/g, '');

        const command = new CreateUserPoolCommand({
          PoolName: providedUserPoolName,
          AccountRecoverySetting: this.getAccountRecoverySetting(),
          AutoVerifiedAttributes: [VerifiedAttributeType.EMAIL],
          AliasAttributes: [AliasAttributeType.EMAIL, AliasAttributeType.PREFERRED_USERNAME],
          DeletionProtection: DeletionProtectionType.ACTIVE,
          UserAttributeUpdateSettings: { AttributesRequireVerificationBeforeUpdate: [VerifiedAttributeType.EMAIL] },
          UsernameConfiguration: { CaseSensitive: false }
        });

        this.sendCreateUserPool(command);
      }
    });
  }

  /**
   * 
   */
  private async createUserPoolAppClient(userPoolId: string) {

    const command = new CreateUserPoolClientCommand({
      ClientName: 'InfoMapper Builder',
      UserPoolId: userPoolId,
      ExplicitAuthFlows: this.getAllUserPoolClientAuthFlows()
    });

    try {
      const response: CreateUserPoolClientCommandOutput = await this.cognitoIdPClient.send(command);
      console.log('User Pool app client created:', response);
      // Maybe add Snackbar here.
      this.authService.signOut();
    } catch (e: any) {
      console.log('Error creating the User Pool app client:', e);
    }
  }

  /**
   * 
   * @returns 
   */
  getAccountRecoverySetting(): AccountRecoverySettingType {
    const recoveryOptionType: RecoveryOptionType = {
      Name: RecoveryOptionNameType.VERIFIED_EMAIL,
      Priority: 1
    };

    return { RecoveryMechanisms: [recoveryOptionType] };
  }

  /**
   * 
   */
  private getAllUserPoolClientAuthFlows(): ExplicitAuthFlowsType[] {
    return [
      ExplicitAuthFlowsType.ALLOW_ADMIN_USER_PASSWORD_AUTH,
      ExplicitAuthFlowsType.ALLOW_CUSTOM_AUTH,
      ExplicitAuthFlowsType.ALLOW_REFRESH_TOKEN_AUTH,
      ExplicitAuthFlowsType.ALLOW_USER_PASSWORD_AUTH,
      ExplicitAuthFlowsType.ALLOW_USER_SRP_AUTH
    ];
  }

  /**
   * @returns A boolean of whether the existing account type FormControl has a value.
   */
  isExistingSelected(): boolean {
    return !!this.accountTypeFG.get('existingAccountType').value;
  }

  /**
   * @returns A boolean of whether the new account type FormControl has a value.
   */
  isNewSelected(): boolean {
    return !!this.accountTypeFG.get('newAccountType').value;
  }

  /**
   * Increases the currentPageIndex by 1 and sets the currentPage to that value.
   */
  nextPage(): void {
    this.currentPage = this.signUpPages[this.currentPageIndex += 1];
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
   */
  ngOnInit(): void {
    this.serviceAccountSignIn();
  }

  /**
   * Decreases the currentPageIndex by 1 and sets the currentPage to that value.
   */
  previousPage(): void {
    this.currentPage = this.signUpPages[this.currentPageIndex -= 1];
  }

  /**
   * 
   * @param command 
   */
  async sendCreateUserPool(command: CreateUserPoolCommand) {

    try {
      const response: CreateUserPoolCommandOutput = await this.cognitoIdPClient.send(command);
      console.log('User Pool created:', response);

      this.createUserPoolAppClient(response.UserPool.Id);
    }
    catch (e: any) {
      console.log('Error creating User Pool:', e);
    }
  }

  /**
   * Asynchronously sign in as the service account and get its credentials.
   */
  private serviceAccountSignIn() {
    this.authService.signIn('owf.service', 'I%9cY!#4Hw1').pipe(first())
    .subscribe((user: CognitoUser) => {
      
    });
  }

  /**
   * 
   */
  submitAndExit(): void {
    this.createUserPool();
  }

}
