import { Component,
          OnInit }    from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

          
@Component({
  selector: 'app-sign-up-first',
  templateUrl: './sign-up-first-page.component.html',
  styleUrls: ['./sign-up-first-page.component.scss']
})
export class SignUpFirstPageComponent implements OnInit {

  accountType: string;
  /** All InfoMapper account types. */
  readonly accountTypes = ['', 'Individual', 'Organization', 'Community'];
  /** The Form Group with both the existing and new account type Controls. Only one
   * will be chosen. */
  accountTypeFG = new FormGroup({
    existingAccountType: new FormControl(''),
    newAccountType: new FormControl('')
  });
  /** Name of the current create account 'page' to be shown to the user. Will consist
   * of 'first', 'second', ... , and end with 'last'. */
  currentPage: string;
  /** The index of the current page in the signUpPages array. */
  private currentPageIndex = 0;
  /** All 'pages' to be shown for creating a new account under the '/signup' app path. */
  private readonly signUpPages = ['first', 'second', 'third', 'fourth', 'last'];


  /**
   * The constructor for the SignUpFirstPageComponent.
   */
  constructor() {

    this.currentPage = this.signUpPages[this.currentPageIndex];
  }


  /**
   * 
   * @param accountType 
   * @param choiceType
   */
  accountTypeChosen(accountType: string, choiceType: string): void {
    this.accountType = choiceType + ':' + accountType;
  }

  /**
   * 
   * @returns 
   */
  canProgress(): boolean {

    if (this.currentPage === 'first') {
      return !(!!this.accountTypeFG.get('existingAccountType').value ||
      !!this.accountTypeFG.get('newAccountType').value)
    }
    return true; // For now.
  }

  /**
   * 
   */
  isExistingSelected(): boolean {
    return !!this.accountTypeFG.get('existingAccountType').value;
  }

  /**
   * 
   */
  isNewSelected(): boolean {
    return !!this.accountTypeFG.get('newAccountType').value;
  }

  /**
   * 
   */
  nextPage(): void {
    this.currentPage = this.signUpPages[this.currentPageIndex += 1];
  }

  /**
   * 
   */
  ngOnInit(): void {
  }

  /**
   * 
   */
  previousPage(): void {
    this.currentPage = this.signUpPages[this.currentPageIndex -= 1];
  }

}
