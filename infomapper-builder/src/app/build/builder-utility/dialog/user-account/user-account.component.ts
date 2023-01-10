import { Component,
          OnInit }      from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

import { faShield,
          faUser,
          faXmark }     from "@fortawesome/free-solid-svg-icons";
import { Observable }   from "rxjs";

import { AuthService }  from "src/app/services/auth.service";


@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.scss']
})
export class UserAccountComponent implements OnInit {

  /** Array of tabs to be displayed as user account options in the dialog. */
  readonly accountTabs = [
    'General',
    'Security'
  ];
  /** All used FontAwesome icons in the UserAccountComponent. */
  faShield = faShield;
  faUser = faUser;
  faXmark = faXmark;
 


  /**
   * 
   * @param authService 
   * @param dialogRef 
   */
  constructor(private authService: AuthService, private dialogRef: MatDialogRef<UserAccountComponent>) {}


  /**
   * 
   */
  get authUsername(): Observable<string> {
    return this.authService.authUsername$;
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked, and removes this
   * dialog's window ID from the windowManager.
   */
  closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * 
   */
  ngOnInit(): void {
    
  }
}