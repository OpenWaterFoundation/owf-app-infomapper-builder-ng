import { Component,
          OnInit }                          from '@angular/core';
import { FormControl,
          FormGroup, 
          Validators}                       from '@angular/forms';
import { ICredentials }                     from '@aws-amplify/core';
import { AccountRecoverySettingType,
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
          DescribeIdentityProviderCommand}           from "@aws-sdk/client-cognito-identity-provider";
import { CognitoIdentityClient,
          CognitoIdentityClientResolvedConfig,
          DescribeIdentityPoolCommand, 
          DescribeIdentityPoolCommandOutput, 
          GetCredentialsForIdentityCommand,
          GetCredentialsForIdentityCommandOutput,
          GetOpenIdTokenForDeveloperIdentityCommand, 
          GetOpenIdTokenForDeveloperIdentityCommandOutput, 
          UpdateIdentityPoolCommand,
          UpdateIdentityPoolCommandOutput} from "@aws-sdk/client-cognito-identity";
import { ParameterTier,
          ParameterType,
          PutParameterCommand,
          PutParameterCommandOutput,
          SSMClient }                     from '@aws-sdk/client-ssm';
import { fromCognitoIdentity, fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { InvokeCommand, InvokeCommandOutput, LambdaClient }               from '@aws-sdk/client-lambda';
import { fromUtf8, toUtf8 } from "@aws-sdk/util-utf8-node";

import { delay,
          first }                            from 'rxjs';
import { CognitoUserSession }               from 'amazon-cognito-identity-js';
import { AuthService }                      from 'src/app/services/auth.service';
import { CognitoUser }                  from 'amazon-cognito-identity-js';
import { LocalStorageService } from 'src/app/services/local-storage.service'
import { ParamAccountValues } from 'src/app/infomapper-builder-types';
import { AwsCredentialIdentity } from '@aws-sdk/types';

          
@Component({
  selector: 'app-sign-up-main',
  templateUrl: './sign-up-main-page.component.html',
  styleUrls: ['./sign-up-main-page.component.scss']
})
export class SignUpMainPageComponent implements OnInit {

  accountAddType: string;

  accountType: string;
  /** All existing InfoMapper account types. */
  readonly existingAccountTypes = ['', 'Organization', 'Community'];
  /** All InfoMapper account types. */
  readonly newAccountTypes = ['', 'Individual', 'Organization', 'Community'];
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
    accountName: new FormControl(''),

  });
  /**
   * 
   */
  // cognitoIdentityClient: CognitoIdentityClient;
  /** The Identity Provider Client for Cognito User Pools. */
  cognitoIdPClient: CognitoIdentityProviderClient;

  cognitoIdentityClient: CognitoIdentityClient;
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
    accountName: new FormControl('', Validators.required),
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

  lambdaClient: LambdaClient;
  /**
   * 
   */
  paramToAdd: ParamAccountValues = {};
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
    this.serviceAccountSignIn();
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
   * @param username 
   * @param password 
   */
  private async addParameterToSystemsManager(username: string, password: string) {


    const accountName = this.createNewAccountFG.get('accountName').value;
    // Fill out the rest of the necessary parameter fields.
    this.paramToAdd.accountName = accountName;
    this.paramToAdd.accountType = this.accountType;
    // TODO: Remove the hard coded path for testing with variable.
    this.paramToAdd.accountPath = 'test/';

    const command = new PutParameterCommand({
      Name: '/user-pool/' + this.accountType + '/' + accountName.replace(/\s+/g, ''),
      Value: JSON.stringify(this.paramToAdd, null, 2),
      DataType: 'text',
      Tier: ParameterTier.STANDARD,
      Type: ParameterType.STRING
    });

    this.storageService.setUserParamAccount({
      slug: '/user-pool/' + this.accountType + '/' + accountName.replace(/\s+/g, ''),
      values: this.paramToAdd
    })

    try {
      const response: PutParameterCommandOutput = await this.SSMClient.send(command);
      console.log('Successfully put parameter into Systems Manager:', response);

      this.authService.signIn(username, password).pipe(
        first(),
        delay(1000)
      ).subscribe({
        next: (user: CognitoUser) => {
          this.authService.successfulLoginSetup(user);
        },
        error: (err: any) => {
          console.log('Error signing in newly confirmed user:', err);
        }
      });
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
    const password = this.createNewAccountFG.get('userPassword').value;
    var appClientId = '';

    if (this.accountAddType === 'New') {
      appClientId = this.paramToAdd.userPoolClientId;
    }
    else if (this.accountAddType === 'Existing') {
      appClientId = this.storageService.getUserParamAccount().values.userPoolClientId;
    }

    const command = new ConfirmSignUpCommand({
      ClientId: appClientId,
      ConfirmationCode: confirmationCode,
      Username: username
    });

    try {
      const response: ConfirmSignUpCommandOutput = await this.cognitoIdPClient.send(command);
      console.log('Successfully confirmed new user!', response);

      // Maybe add Snackbar here.
      this.authService.signOut(true);

      if (this.accountAddType === 'New') {
        this.addParameterToSystemsManager(username, password);
      }
      else if (this.accountAddType == 'Existing') {
        this.authService.signIn(username, password).pipe(
          first()
        ).subscribe({
          next: (user: CognitoUser) => {
            this.authService.successfulLoginSetup(user);
          },
          error: (err: any) => {
            console.log('Error signing in newly confirmed user:', err);
          }
        });
      }
    }
    catch (e: any) {
      console.log('Error confirming new user:', e);
    }

  }

  /**
   * Create all AWS SDK Clients used in new user sign up to both new and existing
   * account types.
   */
  private createAWSClients(): void {

    this.authService.getAllCredentials().pipe(first()).subscribe({
      next: (cred: {session: CognitoUserSession, credentials: ICredentials}) => {

        let config = {
          region: "us-west-2",
          credentials: {
            accessKeyId: cred.credentials.accessKeyId,
            secretAccessKey: cred.credentials.secretAccessKey,
            sessionToken: cred.credentials.sessionToken,
            expiration: cred.credentials.expiration
          }
        };

        this.cognitoIdPClient = new CognitoIdentityProviderClient(config);
        this.cognitoIdentityClient = new CognitoIdentityClient(config);
        this.lambdaClient = new LambdaClient(config);
        this.SSMClient = new SSMClient(config);
      }
    });
  }

  /**
   * 
   */
  private async createUserPool() {

    const accountName = this.createNewAccountFG.get('accountName').value.replace(/\s+/g, '');

    const command = new CreateUserPoolCommand({
      PoolName: 'InfoMapper-' + accountName,
      AccountRecoverySetting: this.getAccountRecoverySetting(),
      AutoVerifiedAttributes: [VerifiedAttributeType.EMAIL],
      AliasAttributes: [AliasAttributeType.EMAIL, AliasAttributeType.PREFERRED_USERNAME],
      DeletionProtection: DeletionProtectionType.ACTIVE,
      UserAttributeUpdateSettings: { AttributesRequireVerificationBeforeUpdate: [VerifiedAttributeType.EMAIL] },
      UsernameConfiguration: { CaseSensitive: false }
    });

    try {
      const response: CreateUserPoolCommandOutput = await this.cognitoIdPClient.send(command);
      console.log('USER POOL CREATED:', response);
      this.paramToAdd.userPoolId = response.UserPool.Id

      this.createUserPoolAppClient(response.UserPool.Id);
    }
    catch (e: any) {
      console.log('Error creating User Pool:', e);
    }
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
      this.paramToAdd.userPoolClientId = response.UserPoolClient.ClientId;

      this.signUpUser(response.UserPoolClient.ClientId);
      this.updateIdentityPool(userPoolId, response.UserPoolClient.ClientId)
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
  }

  /**
   * Decreases the currentPageIndex by 1 and sets the currentPage to that value.
   */
  previousPage(): void {
    this.currentPage = this.signUpPages[this.currentPageIndex -= 1];
  }

  /**
   * Asynchronously sign in as the service account, then create each AWS Client with
   * its credentials once the sign in process is complete.
   */
  private serviceAccountSignIn() {
    this.authService.signIn('owf.service', 'I%9cY!#4Hw1', true).pipe(first())
    .subscribe(() => {
      this.createAWSClients();
    });
  }

  /**
   * 
   * @param userPoolId 
   */
  private async signUpUser(appClientId: string) {
    const userEmail = this.createNewAccountFG.get('userAccountEmail').value;
    const username = this.createNewAccountFG.get('userAccountUsername').value;
    const password = this.createNewAccountFG.get('userPassword').value;

    const command = new SignUpCommand({
      ClientId: appClientId,
      Password: password,
      Username: username,
      UserAttributes: [{
        Name: 'email',
        Value: userEmail
      }]
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
   */
  submitNewAccountData(): void {

    if (this.accountAddType === 'New') {
      this.createUserPool();
      this.currentPage = this.signUpPages[this.currentPageIndex += 1];
    }
    else if (this.accountAddType === 'Existing') {
      this.signUpUser(this.storageService.getUserParamAccount().values.userPoolClientId);
      this.currentPage = this.signUpPages[this.currentPageIndex += 1];
    }
    
  }

  /**
   * 
   * @param userPoolId 
   * @param appClientId 
   */
  private async updateIdentityPool(userPoolId: string, appClientId: string) {

    const command = new InvokeCommand({
      FunctionName: 'test_function'
      // Payload: fromUtf8(JSON.stringify(payload)) 
    });

    try {
      const response: InvokeCommandOutput = await this.lambdaClient.send(command);
      console.log('LAMBDA FUNCTION INVOKED WITH RESPONSE:', response);
      const payload = JSON.parse(toUtf8(response.Payload));
      const body = JSON.parse(payload.body);
      console.log('RESPONSE BODY:', body);
      const identityId = body.IdentityId;
      const token = body.Token;

      

      const credCommand = new GetCredentialsForIdentityCommand({
        IdentityId: identityId,
        Logins: {
          'cognito-identity.amazonaws.com': token
        }
      });

      try {
        const response: GetCredentialsForIdentityCommandOutput = await this.cognitoIdentityClient.send(credCommand);
        console.log('it worked!', response);

        const client = new CognitoIdentityClient({
          region: "us-west-2",
            credentials: {
              accessKeyId: response.Credentials.AccessKeyId,
              secretAccessKey: response.Credentials.SecretKey,
              sessionToken: response.Credentials.SessionToken,
              expiration: response.Credentials.Expiration
            }
        });

        const describeCommand = new DescribeIdentityPoolCommand({
          IdentityPoolId: this.authService.identityPoolId
        });

        try {
          const response: DescribeIdentityPoolCommandOutput = await client.send(describeCommand);
          console.log('Success describing Identity Pool:', response);
        }
        catch (e: any) {
          console.log('Error describing Identity Pool:', e);
        }
      }
      catch (e: any) {
        console.log('it didn not work for some reason:', e);
      }

      // const describeCommand = new DescribeIdentityPoolCommand({
      //   IdentityPoolId: this.authService.identityPoolId
      // });

      // try {
      //   const response: DescribeIdentityPoolCommandOutput = await this.cognitoIdentityClient.send(describeCommand);
      //   console.log('Success describing Identity Pool:', response);
      // }
      // catch (e: any) {
      //   console.log('Error describing Identity Pool:', e);
      // }
    }
    catch (e: any) {
      console.log('Error running the Lambda function:', e);
    }

    // const describeCommand = new DescribeIdentityPoolCommand({
    //   IdentityPoolId: this.authService.identityPoolId
    // });

    // try {
    //   const response: DescribeIdentityPoolCommandOutput = await this.cognitoIdentityClient.send(describeCommand);
    //   console.log('Success describing Identity Pool:', response);
    //   // Add the new provider to the Identity Pool.
    //   var allIdentityProviders = response.CognitoIdentityProviders;
    //   allIdentityProviders.push({
    //     ClientId: appClientId,
    //     ProviderName: userPoolId
    //   });

    //   const updateCommand = new UpdateIdentityPoolCommand({
    //     AllowUnauthenticatedIdentities: false,
    //     IdentityPoolId: this.authService.identityPoolId,
    //     IdentityPoolName: 'infomapper-builder-pool-test',
    //     CognitoIdentityProviders: allIdentityProviders
    //   });
  
    //   try {
    //     const response: UpdateIdentityPoolCommandOutput = await this.cognitoIdentityClient.send(updateCommand);
    //     console.log('Identity Pool updated:', response);
    //   }
    //   catch (e: any) {
    //     console.log('Error updating Identity Pool:', e);
    //   }
    // }
    // catch (e: any) {
    //   console.log('Error describing Identity Pool:', e);
    // }

    // const command = new GetOpenIdTokenForDeveloperIdentityCommand({
    //   IdentityPoolId: this.authService.identityPoolId,
    //   Logins: {
    //     'infomapper.builder.dev': 'test'
    //   }
    // });

    // try {
    //   const response: GetOpenIdTokenForDeveloperIdentityCommandOutput = await this.cognitoIdentityClient.send(command);
    //   console.log('It somehow freaking worked:', response);
    // }
    // catch (e: any) {
    //   console.log('Error getting token for dev identity', e);
    // }


  }

}
