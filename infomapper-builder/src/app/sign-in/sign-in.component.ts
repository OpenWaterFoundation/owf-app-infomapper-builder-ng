import { Component,
          OnInit }     from '@angular/core';
import { AbstractControl,
          FormControl,
          FormGroup,
          Validators } from '@angular/forms';

import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';

import { faEye,
          faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'im-builder-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss', '../shared-styles.scss']
})
export class SignInComponent implements OnInit {

  /** All used FontAwesome icons in the DialogComponent. */
  
  /** The custom & built-in error messages to be displayed under a form with an error. */
  formErrorMessages = {
    required: 'Required'
  }
  /**
   * 
   */
  signInFG = new FormGroup({
    user: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });
  /** Font Awesome icon used to display at the end of the password input field. */
  visibilityIcon = faEye;
  /** Boolean set to whether the password input field is visible or 'hidden'. */
  visibleInput = false;
  /** Dynamic tooltip to display over the password icon on mouse hover. */
  visibilityMessage = 'Show password';
  

  /**
   * 
   */
  constructor() {

  }


  /**
   * 
   * @param control The FormControl that will be checked for errors.
   * @returns An array with all errors for the control, or an empty array of no errors.
   */
  formErrors(control: AbstractControl): string[] {
    return control.errors ? Object.keys(control.errors) : [];
  }

  /**
   * 
   */
  ngOnInit(): void {
  }

  /**
   * 
   */
  signInUser(): void {
    console.log(this.signInFG.get('user').value);
    console.log(this.signInFG.get('password').value);
  }

  /**
   * 
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
