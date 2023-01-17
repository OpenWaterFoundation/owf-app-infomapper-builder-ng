import { Component,
          Input,
          OnInit }     from '@angular/core';
import { AbstractControl,
          FormGroup }  from '@angular/forms';
import { faEye,
          faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'sign-up-second-page',
  templateUrl: './sign-up-second-page.component.html',
  styleUrls: ['./sign-up-second-page.component.scss']
})
export class SignUpSecondPageComponent implements OnInit {

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
  constructor() {

  }


  /**
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
