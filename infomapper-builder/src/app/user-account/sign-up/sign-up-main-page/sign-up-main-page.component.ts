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
          ConfirmSignUpCommand,
          ConfirmSignUpCommandOutput,
          CreateUserPoolCommand,
          CreateUserPoolCommandOutput,
          RecoveryOptionType,
          RecoveryOptionNameType,
          SignUpCommand,
          SignUpCommandOutput,
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
import { CognitoUserSession }              from 'amazon-cognito-identity-js';
import { AuthService }                     from 'src/app/services/auth.service';
import { ParameterTier, ParameterType, PutParameterCommand,
          PutParameterCommandOutput,
          SSMClient }                      from '@aws-sdk/client-ssm';
import { LocalStorageService } from 'src/app/services/local-storage.service';

          
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
  confirmNewUserFG = new FormGroup({
    confirmationCode: new FormControl('', Validators.required)
  });
  /**
   * 
   */
  createNewAccountFG = new FormGroup({
    userPoolName: new FormControl('', Validators.required),
    userAccountEmail: new FormControl('', [Validators.required, Validators.email]),
    userAccountUsername: new FormControl('', Validators.required),
    userPassword: new FormControl('', Validators.required)
  });
  /**
   * 
   */
  currentAppClientId: string;
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
  private readonly signUpPages = ['first', 'last', 'confirm'];
  /**
   * 
   */
  private SSMClient: SSMClient


  /**
   * The constructor for the SignUpMainPageComponent.
   */
  constructor(private authService: AuthService, private storageService: LocalStorageService) {

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
   */
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

    const userPoolName = this.createNewAccountFG.get('userPoolName').value;
    // Fill out the rest of the necessary parameter fields.
    this.paramToAdd['accountName'] = userPoolName;
    this.paramToAdd['accountType'] = this.accountType;
    // TODO: Remove the hard coded path for testing with variable.
    this.paramToAdd['accountPath'] = 'test/';

    const command = new PutParameterCommand({
      Name: '/user-pool/' + this.accountType + '/' + userPoolName.replace(/\s+/g, ''),
      Value: JSON.stringify(this.paramToAdd, null, 2),
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
    else if (this.currentPage == 'last') {

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
  async confirmUserSignUp() {

    const username = this.createNewAccountFG.get('userAccountUsername').value;
    const confirmationCode = this.confirmNewUserFG.get('confirmationCode').value;

    console.log('User Pool client id:', this.paramToAdd['userPoolClientId']);
    console.log('Username:', username);

    const command = new ConfirmSignUpCommand({
      ClientId: this.paramToAdd['userPoolClientId'],
      ConfirmationCode: confirmationCode,
      Username: username
    });

    try {
      const response: ConfirmSignUpCommandOutput = await this.cognitoIdPClient.send(command);
      console.log('Successfully confirmed new user!', response);
      this.addParameterToSystemsManager();
    }
    catch (e: any) {
      console.log('Error confirming new user:', e);
    }

    
    // Maybe add Snackbar here.
    this.authService.signOut();
  }

  /**
   * 
   */
  private async createIdentityPool(userPoolId: string, appClientId: string) {

    console.log('Current user credentials:', this.cognitoCred);

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

    try {
      const response: CreateIdentityPoolCommandOutput = await this.cognitoIdentityClient.send(command);
      console.log('Identity Pool created:', response);
    }
    catch (e: any) {
      console.log('Parameter not added to SSM. Error creating Identity Pool:', e);
    }

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
          PoolName: 'InfoMapper-' + providedUserPoolName,
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
      console.log('USER POOL APP CLIENT CREATED:', response);
      this.paramToAdd['userPoolClientId'] = response.UserPoolClient.ClientId;

      this.signUpUser(response.UserPoolClient.ClientId);
    } catch (e: any) {
      console.log('Error creating the User Pool app client:', e);
    }
  }

  /**
   * 
   * @param userPoolId 
   */
  private async signUpUser(appClientId: string) {
    const userEmail = this.createNewAccountFG.get('userAccountEmail').value;
    const username = this.createNewAccountFG.get('userAccountUsername').value;
    const password = this.createNewAccountFG.get('userPassword').value;

    // const command = new AdminCreateUserCommand({
    //   Username: username,
    //   UserPoolId: userPoolId,
    //   DesiredDeliveryMediums: [ DeliveryMediumType.EMAIL ],
    //   UserAttributes: [{
    //     Name: 'email',
    //     Value: userEmail
    //   }]
    // });

    // TODO: If SignUpCommand works, 
    // try {
    //   const response: AdminCreateUserCommandOutput = await this.cognitoIdPClient.send(command);
    //   console.log('USER POOL USER CREATED:', response);

    //   // this.createIdentityPool(userPoolId, appClientId);
    //   this.addParameterToSystemsManager();
    //   // Maybe add Snackbar here.
    //   this.authService.signOut();
    // }
    // catch (e: any) {
    //   console.log('Error creating User Pool user:', e);
    // }

    const command = new SignUpCommand({
      ClientId: appClientId,
      Password: password,
      Username: username,
      UserAttributes: [{
        Name: 'email',
        Value: userEmail
      }]
      // Username: username,
      // UserPoolId: userPoolId,
      // DesiredDeliveryMediums: [ DeliveryMediumType.EMAIL ],
      // UserAttributes: [{
      //   Name: 'email',
      //   Value: userEmail
      // }]
    });

    try {
      const response: SignUpCommandOutput = await this.cognitoIdPClient.send(command);
      console.log('USER POOL USER CREATED:', response);
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
  private async sendCreateUserPool(command: CreateUserPoolCommand) {

    try {
      const response: CreateUserPoolCommandOutput = await this.cognitoIdPClient.send(command);
      console.log('USER POOL CREATED:', response);
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
    this.authService.signIn('owf.service', 'I%9cY!#4Hw1', true).pipe(first())
    .subscribe(() => {
      // Don't need to do anything. The service is signed in at this point, and an
      // asynchronous call to retrieve its credentials will be done later.
    });
  }

  /**
   * 
   */
  submitNewAccountData(): void {

    if (this.accountAddType === 'New') {
      this.createUserPool();
      this.currentPage = this.signUpPages[this.currentPageIndex += 1];
    }
    else if (this.accountAddType === 'Existing') {
      console.log('Doing stuff on an exiting account.');
    }
    
  }

}
