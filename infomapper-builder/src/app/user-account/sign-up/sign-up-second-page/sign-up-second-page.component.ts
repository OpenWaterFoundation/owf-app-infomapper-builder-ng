import { Component,
          ElementRef,
          Input,
          OnInit, 
          ViewChild}     from '@angular/core';
import { AbstractControl,
          FormGroup }  from '@angular/forms';
import { ICredentials } from '@aws-amplify/core';
import { faEye,
          faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { ParamAccount } from 'src/app/infomapper-builder-types';
import { CognitoUserSession }    from 'amazon-cognito-identity-js';
import { AuthService } from 'src/app/services/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { LoaderService } from 'src/app/services/loader.service';
import { Parameter } from '@aws-sdk/client-ssm';
import { first } from 'rxjs';

@Component({
  selector: 'sign-up-second-page',
  templateUrl: './sign-up-second-page.component.html',
  styleUrls: ['./sign-up-second-page.component.scss']
})
export class SignUpSecondPageComponent implements OnInit {

  /**  The InfoMapper Account search input element. Used to focus on after creation
   * by using TypeScript. */
  @ViewChild("searchInput") private _searchInputElement: ElementRef;
  /** Array of all found Parameters from the AWS SSM using a service account. */
  accounts: ParamAccount[] = [];
  /**
   * 
   */
  @Input('accountAddType') accountAddType: string;
  /**
   * 
   */
  @Input('accountType') accountType: string;
  /**
   * 
   */
  @Input('addToExistingAccountFG') addToExistingAccountFG: FormGroup;
  /**
   * 
   */
  @Input('createNewAccountFG') createNewAccountFG: FormGroup;
  /** The array of accounts for all currently created AWS Cognito User Pools. */
  displayAccounts: ParamAccount[] = [{ slug: '', values: { accountName: '' } }];
  /** The custom & built-in error messages to be displayed under a form with an error. */
  formErrorMessages = {
    required: 'Field required',
    email: 'Incorrect email format'
  }
  /** Font Awesome icon used to display at the end of the password input field. */
  visibilityIcon = faEye;
  /** Boolean set to whether the password input field is visible or 'hidden'. */
  visibleInput = false;
  /** Dynamic tooltip to display over the password icon on mouse hover. */
  visibilityMessage = 'Show password';


  /**
   * 
   * @param authService 
   */
  constructor(private authService: AuthService, private loaderService: LoaderService,
  private storageService: LocalStorageService) {

  }


  /**
   * @param control The FormControl that will be checked for errors.
   * @returns An array with all errors for the control, or an empty array of no errors.
   */
  formErrors(control: AbstractControl): string[] {
    return control.errors ? Object.keys(control.errors) : [];
  }

  private async getAllParameters(credentials: ICredentials) {

    try {
      var allParameters = await this.authService.getParameterStoreParams(credentials);
      this.populateAccounts(allParameters.Parameters);
      console.log('Success getting all Parameters from the Auth Service!', allParameters);
      this.loaderService.hideLoader();
    }
    catch (e: any) {
      console.log('Error getting all Parameters from the Auth service:', e);
      this.loaderService.hideLoader();
    }
  }

  private getParametersSetup() {

    this.authService.getAllCredentials().pipe(first()).subscribe({
      next: (cred: {session: CognitoUserSession, credentials: ICredentials}) => {
        this.getAllParameters(cred.credentials);
      },
      error: (err: any) => {

      }
    });

    
  }

  /**
   * 
   */
  ngOnInit(): void {

    if (this.accountAddType === 'Existing') {
      this.loaderService.showLoader();
      this.getParametersSetup();
    }
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
    // TODO: Only sign out when the account has been created and everything is done.
    // this.authService.signOut(true);

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
