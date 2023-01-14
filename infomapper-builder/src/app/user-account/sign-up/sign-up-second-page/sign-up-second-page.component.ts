import { Component,
          Input,
          OnInit }                       from '@angular/core';
import { AbstractControl,
          FormGroup }                    from '@angular/forms';

@Component({
  selector: 'sign-up-second-page',
  templateUrl: './sign-up-second-page.component.html',
  styleUrls: ['./sign-up-second-page.component.scss']
})
export class SignUpSecondPageComponent implements OnInit {


  @Input('accountAddType') accountAddType: string;
  /**
   * 
   */
  @Input('accountType') accountType: string;

  @Input('createNewAccountFG') createNewAccountFG: FormGroup;

  /** The custom & built-in error messages to be displayed under a form with an error. */
  formErrorMessages = {
    required: 'Required'
  }


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

}
