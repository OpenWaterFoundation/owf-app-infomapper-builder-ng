import { Component,
          EventEmitter,
          OnInit, 
          Output}        from '@angular/core';
import { AbstractControl,
          FormControl,
          FormGroup,
          Validators }    from '@angular/forms';
import { Router }         from '@angular/router';

import { faEye,
          faEyeSlash }    from '@fortawesome/free-solid-svg-icons';
import { Subject,
          takeUntil }     from 'rxjs';
import { CognitoService } from '../services/cognito.service';

@Component({
  selector: 'im-builder-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss', '../shared-styles.scss']
})
export class SignInComponent implements OnInit {

  /** Subject that is completed when this component is destroyed. */
  destroyed = new Subject<void>();
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
  constructor(private cognitoService: CognitoService, private router: Router) {

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
  * Called once right before this component is destroyed.
  */
   ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
   * 
   */
  signInUser(): void {

    const usernameOrEmail = this.signInFG.get('user').value;
    const pw = this.signInFG.get('password').value;

    this.cognitoService.signIn(usernameOrEmail, pw)
    .pipe(takeUntil(this.destroyed))
    .subscribe({
      next: (response: any) => {
        console.log('Authentication success:', response);
        this.router.navigate(['/content-page/home']);
        this.cognitoService.setUserVerified = true;
      },
      error: (error: any) => {
        console.log('Incorrect credentials:', error);
      }
  });
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
