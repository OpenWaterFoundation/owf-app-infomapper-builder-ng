import { Component,
          ElementRef,
          OnInit, 
          ViewChild }                   from '@angular/core';
import { AbstractControl,
          FormControl,
          FormGroup,
          Validators }                  from '@angular/forms';
import { Router }                       from '@angular/router';

import { MatSnackBar,
          MatSnackBarHorizontalPosition,
          MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { SSMClient,
          GetParametersByPathCommand,
          GetParametersByPathCommandOutput,
          Parameter }                   from "@aws-sdk/client-ssm";
import { AuthFlowType, CognitoIdentityProviderClient,
          InitiateAuthCommand, 
          InitiateAuthCommandOutput}         from "@aws-sdk/client-cognito-identity-provider";
import { ICredentials }                 from '@aws-amplify/core';

import { faEye,
          faEyeSlash }                  from '@fortawesome/free-solid-svg-icons';
import { first,
          Subject }                     from 'rxjs';
import { CognitoUser }                  from 'amazon-cognito-identity-js';

import { AuthService }                  from '../../services/auth.service';
import { LoaderService }                from '../../services/loader.service';
import { ParamAccount }                 from '../../infomapper-builder-types';
import { LocalStorageService }          from '../../services/local-storage.service';


@Component({
  selector: 'im-builder-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss', '../../shared-styles.scss']
})
export class SignInComponent implements OnInit {

  /**  The InfoMapper Account search input element. Used to focus on after creation
   * by using TypeScript. */
  @ViewChild("searchInput") private _searchInputElement: ElementRef;
  /**
   * 
   */
  cognitoUser: CognitoUser;
  /**
   * 
   */
  confirmingAccount: boolean;
  /** Subject that is completed when this component is destroyed. */
  destroyed = new Subject<void>();
  /** All used FontAwesome icons in the SignInComponent (exception: visibilityIcon).  */
  
  /** The custom & built-in error messages to be displayed under a form with an error. */
  formErrorMessages = {
    required: 'Required'
  };
  /** The Angular Form Group used by the sign in component to obtain user input and
   * validation. */
  signInFG = new FormGroup({
    accountType: new FormControl('', Validators.required),
    user: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });
  /** How many milliseconds the error snackbar will be displayed for. */
  snackBarDuration = 3000;
  /** Sets the horizontal position of the error snackbar to display on the right
   * side of the screen. */
  snackBarHorizontalPos: MatSnackBarHorizontalPosition = 'end';
  /** Sets the vertical position of the error snackbar to display at the top of
  * the screen. */
  snackbarVerticalPos: MatSnackBarVerticalPosition = 'top';
  /** Array of all found Parameters from the AWS SSM using a service account. */
  private accounts: ParamAccount[] = [];
  /** The array of accounts for all currently created AWS Cognito User Pools. */
  displayAccounts: ParamAccount[] = [{ slug: '', values: { accountName: '' } }];
  /** Font Awesome icon used to display at the end of the password input field. */
  visibilityIcon = faEye;
  /** Boolean set to whether the password input field is visible or 'hidden'. */
  visibleInput = false;
  /** Dynamic tooltip to display over the password icon on mouse hover. */
  visibilityMessage = 'Show password';
  

  /**
   * The constructor for the SignInComponent.
   * @param authService Service for using AWS Amplify to authenticate and authorize
   * different users using the IM Builder.
   * @param snackBar Service to dispatch Angular Material snack bar messages.
   */
  constructor(private authService: AuthService, private loaderService: LoaderService,
  private router: Router, private storageService: LocalStorageService, private snackBar: MatSnackBar) {

  }


  /**
   * @param control The FormControl that will be checked for errors.
   * @returns An array with all errors for the control, or an empty array of no errors.
   */
  formErrors(control: AbstractControl): string[] {
    return control.errors ? Object.keys(control.errors) : [];
  }

  /**
   * Use the currently signed-in service account (and its credentials) to utilize
   * the AWS JavaScript SDK and retrieve all Parameter objects stored in the AWS
   * Systems Manager Parameter store.
   * @param cred The credentials obtained by the AWS Amplify Auth class from the
   * service account.
   */
  private async getParameterStoreParams(cred: ICredentials) {
    const client = new SSMClient({
      region: "us-west-2",
      credentials: {
        accessKeyId: cred.accessKeyId,
        secretAccessKey: cred.secretAccessKey,
        sessionToken: cred.sessionToken,
        expiration: cred.expiration
      }
    });

    const command = new GetParametersByPathCommand({ Path: '/user-pool/', Recursive: true });
    const response: GetParametersByPathCommandOutput = await client.send(command);

    this.populateAccounts(response.Parameters);
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
   */
  ngOnInit(): void {
    // TODO.
    this.loaderService.showLoader();
    this.serviceAccountSignIn();
    // this.x_anonymousUserSignIn();
  }

  /**
  * Called once right before this component is destroyed.
  */
  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
  * Displays the self-closing error message so users know what went wrong.
  */
  openErrorSnackBar() {
    const message = 'Incorrect username/email or password. Please try again.';

    this.snackBar.open(message, null, {
      duration: this.snackBarDuration,
      panelClass: 'snackbar-error',
      horizontalPosition: this.snackBarHorizontalPos,
      verticalPosition: this.snackbarVerticalPos
    });
  }

  /**
   * Whenever the mat-select field is clicked, focus on the input field so users
   * can immediately start typing.
   */
  openSelectChange(): void {
    this._searchInputElement.nativeElement.focus();
  }

  /**
   * Called on any detected change on the mat option menu. Obtains the AWS SSM Parameter
   * object so the correct User Pool is used to sign a user in.
   * @param $event The Event from the template file when an InfoMapper Account has
   * been selected from the drop down option menu.
   * @param paramAccount The AWS SSM Parameter object associated with the chosen
   * account.
   */
  paramAccountSelected($event: any, paramAccount: ParamAccount) {

    if ($event.source.selected) {
      this.storageService.setUserParamAccount(paramAccount);
    }
  }

  /**
   * Iterates over all returned Parameter Store Parameters, and assigns each one
   * to the more accessible InfoMapper created ParamAccount.
   * @param allParameters All Parameter object returned from the service account
   * using the AWS SDK to retrieve all current Parameters.
   */
  private populateAccounts(allParameters: Parameter[]): void {

    for (let param of allParameters) {
      let option: ParamAccount = {
        slug: param.Name,
        values: JSON.parse(param.Value)
      };
      this.accounts.push(option);
    }
    console.log('ALL PARAM ACCOUNTS:', this.accounts);

    // Sign out of the service account now that a user account is being logged into.
    this.authService.signOut(true);

    this.loaderService.hideLoader();
  }

  /**
   * Called after each keyup when searching for an InfoMapper Account in its search
   * field.
   * @param $event The event passed in from the template.
   */
  searchForAccount($event: KeyboardEvent): any {

    const input = (<HTMLInputElement>$event.target).value.toLowerCase();

    // If the value in the search bar is empty, then all dates can be shown.
    if (input === '') {
      this.displayAccounts = [{ slug: '', values: { accountName: '' } }];
      return;
    }

    if ($event.key.toLowerCase() === 'backspace') {
      this.displayAccounts = this.accounts.filter((param: ParamAccount) => {
        // Human readable name or slug name.
        return param.values.accountName.toLowerCase().includes(input) ||
        param.slug.toLowerCase().includes(input);
      });
    } else {
      this.displayAccounts = this.accounts.filter((param: ParamAccount) => {
        // Human readable name or slug name.
        return param.values.accountName.toLowerCase().includes(input) ||
        param.slug.toLowerCase().includes(input);
      });
    }
  }

  /**
   * Utilizes the Cognito service to attempt to sign the user in with the provided
   * credentials when the Sign In button is clicked. Shows the home page is successful,
   * and an error snackbar if not.
   */
  async signInUser() {

    const user = this.signInFG.get('user').value;
    const password = this.signInFG.get('password').value;

    this.authService.signIn(user, password).pipe(first()).subscribe({
      next: (user: CognitoUser) => {

        console.log('Successful user login:', user);
        if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
          this.cognitoUser = user;
          this.confirmingAccount = true;
          return;
        }
        
        this.authService.successfulLoginSetup(user);
      },
      error: (e: any) => {
        this.openErrorSnackBar();
        console.log('Error signing user in:', e);
      }
    });
  }

  /**
   * Asynchronously sign in as the service account and get its credentials.
   */
  private serviceAccountSignIn() {
    this.authService.signIn('owf.service', 'I%9cY!#4Hw1', true).pipe(first())
    .subscribe(() => {

      this.authService.getCurrentCredentials().pipe(first())
      .subscribe((credentials: ICredentials) => {

        this.getParameterStoreParams(credentials);
      });
    });

    // this.authService.signInTest('owf.service', 'I%9cY!#4Hw1').pipe(first())
    // .subscribe(({
    //   next: (response: any) => {
    //     console.log(response);
    //     this.getParameterStoreParams();
    //   },
    //   error: (error: any) => {
    //     console.log('Error signing in user:', error);
    //   }
    // }));
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

  /**
   * Uses an anonymous Cognito account to retrieve all Parameters from the SSM Parameter
   * store. Currently unused.
   */
  x_anonymousUserSignIn(): void {
    this.authService.getCurrentCredentials().pipe(first())
    .subscribe((credentials: ICredentials) => {
      this.getParameterStoreParams(credentials);
    });
  }

}
