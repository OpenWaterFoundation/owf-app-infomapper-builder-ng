import { Component,
          OnInit }                         from '@angular/core';
import { FormControl,
          FormGroup, 
          Validators}                      from '@angular/forms';
import { ICredentials }                    from '@aws-amplify/core';
import { AccountRecoverySettingType,
          AdminCreateUserCommand,
          AdminCreateUserCommandOutput,
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
          ExplicitAuthFlowsType, 
          DeliveryMediumType}              from "@aws-sdk/client-cognito-identity-provider";
import { CognitoIdentityClient,
          CreateIdentityPoolCommand, 
          CreateIdentityPoolCommandOutput} from "@aws-sdk/client-cognito-identity";

import { first }                           from 'rxjs';
import { CognitoUser,
          CognitoUserSession }             from 'amazon-cognito-identity-js';
import { AuthService }                     from 'src/app/services/auth.service';
import { ParameterTier, ParameterType, PutParameterCommand,
          PutParameterCommandOutput,
          SSMClient }                      from '@aws-sdk/client-ssm';

          
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
  addToExistingAccountFG = new FormGroup({
    accountTypeName: new FormControl('')
  });
  /**
   * 
   */
  private cognitoCred: {session: CognitoUserSession, credentials: ICredentials};
  /**
   * 
   */
  cognitoIdentityClient: CognitoIdentityClient;
  /** The Identity Provider Client for Cognito User Pools. */
  cognitoIdPClient: CognitoIdentityProviderClient;
  /**
   * 
   */
  createNewAccountFG = new FormGroup({
    userPoolName: new FormControl('', Validators.required),
    userAccountEmail: new FormControl('', [Validators.required, Validators.email]),
    userAccountUsername: new FormControl('', Validators.required)
  });
  /** Name of the current create account 'page' to be shown to the user. Will consist
   * of 'first', 'second', ... , and end with 'last'. */
  currentPage: string;
  /** The index of the current page in the signUpPages array. */
  private currentPageIndex = 0;
  /**
   * 
   */
  paramToAdd: {} = {};
  /** All 'pages' to be shown for creating a new account under the '/signup' app path. */
  private readonly signUpPages = ['first', 'second', 'third', 'last'];
  /**
   * 
   */
  private SSMClient: SSMClient


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

  private async addParameterToSystemsManager() {

    this.SSMClient = new SSMClient({
      region: "us-west-2",
      credentials: {
        accessKeyId: this.cognitoCred.credentials.accessKeyId,
        secretAccessKey: this.cognitoCred.credentials.secretAccessKey,
        sessionToken: this.cognitoCred.credentials.sessionToken,
        expiration: this.cognitoCred.credentials.expiration
      }
    });

    // Fill out the rest of the necessary parameter fields.
    this.paramToAdd['accountName'] = this.createNewAccountFG.get('userPoolName');
    this.paramToAdd['accountType'] = this.createNewAccountFG.get(this.accountType);

    const command = new PutParameterCommand({
      Name: '/user-pool/',
      Value: JSON.stringify({}),
      DataType: 'text',
      Tier: ParameterTier.STANDARD,
      Type: ParameterType.STRING
    });

    try {
      const response: PutParameterCommandOutput = await this.SSMClient.send(command);
      console.log('Successfully put parameter into Systems Manager:', response);
    }
    catch (e: any) {
      console.log('Error putting parameter into Systems Manager:', e);
    }
  }

  /**
   * 
   * @returns 
   */
  canProgress(): boolean {

    if (this.currentPage === 'first') {
      return !(this.accountTypeFG.get('existingAccountType').value ||
      this.accountTypeFG.get('newAccountType').value);
    }
    else if (this.currentPage == 'second') {

      if (this.accountAddType === 'New') {
        return this.createNewAccountFG.invalid;
      }
      else if (this.accountAddType === 'Existing') {
        return false;
      }
      
    }
    return false; // For now.
  }

  /**
   * 
   */
  private createIdentityPool(userPoolId: string, appClientId: string): void {

    this.cognitoIdentityClient = new CognitoIdentityClient({
      region: "us-west-2",
      credentials: {
        accessKeyId: this.cognitoCred.credentials.accessKeyId,
        secretAccessKey: this.cognitoCred.credentials.secretAccessKey,
        sessionToken: this.cognitoCred.credentials.sessionToken,
        expiration: this.cognitoCred.credentials.expiration
      }
    });

    const command = new CreateIdentityPoolCommand({
      AllowUnauthenticatedIdentities: false,
      IdentityPoolName: 'infomapper-builder-pool-test-2',
      CognitoIdentityProviders: [{
        ClientId: appClientId,
        ProviderName: userPoolId
      }]
    });

    this.sendCreateIdentityPool(command);
    
  }

  /**
   * 
   */
  private createUserPool(): void {

    this.authService.getAllCredentials().pipe(first()).subscribe({
      next: (cred: {session: CognitoUserSession, credentials: ICredentials}) => {

        this.cognitoCred = cred;

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
      this.paramToAdd['userPoolClientId'] = response.UserPoolClient.ClientId;

      this.createUserPoolUser(userPoolId);
      // Don't use this here.
      // this.createIdentityPool(userPoolId, response.UserPoolClient.ClientId);
      
    } catch (e: any) {
      console.log('Error creating the User Pool app client:', e);
    }
  }

  /**
   * 
   * @param userPoolId 
   */
  private async createUserPoolUser(userPoolId: string) {
    const userEmail = this.createNewAccountFG.get('userAccountEmail').value;
    const username = this.createNewAccountFG.get('userAccountUsername').value;

    const command = new AdminCreateUserCommand({
      Username: username,
      UserPoolId: userPoolId,
      DesiredDeliveryMediums: [DeliveryMediumType.EMAIL],
      UserAttributes: [{
        Name: 'email',
        Value: userEmail
      }]
    });

    try {
      const response: AdminCreateUserCommandOutput = await this.cognitoIdPClient.send(command);
      console.log('User Pool user created:', response);

      this.addParameterToSystemsManager();
      // Maybe add Snackbar here.
      this.authService.signOut();
    }
    catch (e: any) {
      console.log('Error creating User Pool user:', e);
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
  private async sendCreateIdentityPool(command: CreateIdentityPoolCommand) {

    try {
      const response: CreateIdentityPoolCommandOutput = await this.cognitoIdentityClient.send(command);
      console.log('Identity Pool created:', response);
    }
    catch (e: any) {
      console.log('Error creating Identity Pool:', e);
    }
  }

  /**
   * 
   * @param command 
   */
  private async sendCreateUserPool(command: CreateUserPoolCommand) {

    try {
      const response: CreateUserPoolCommandOutput = await this.cognitoIdPClient.send(command);
      console.log('User Pool created:', response);
      this.paramToAdd['userPoolId'] = response.UserPool.Id

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
    .subscribe(() => {
      // Don't need to do anything. The service is signed in at this point, and an
      // asynchronous call to retrieve its credentials will be done later.
    });
  }

  /**
   * 
   */
  submitAndExit(): void {

    if (this.accountAddType === 'New') {
      this.createUserPool();
    }
    else if (this.accountAddType === 'Existing') {
      console.log('Doing stuff on an exiting account.');
    }
    
  }

}
