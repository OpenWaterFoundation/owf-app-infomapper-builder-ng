import { Component,
          EventEmitter,
          OnInit,
          Output }                   from '@angular/core';

import { faBars }                    from '@fortawesome/free-solid-svg-icons';
import { faUser }                    from '@fortawesome/free-regular-svg-icons';

import { MatDialog,
          MatDialogConfig,
          MatDialogRef }             from '@angular/material/dialog';

import * as IM                       from '@OpenWaterFoundation/common/services'
import { CommonLoggerService }       from '@OpenWaterFoundation/common/services';
import { Observable }                from 'rxjs';

import { AppService }                from 'src/app/services/app.service';
import { AuthService }               from 'src/app/services/auth.service';
import { BreakpointObserverService } from 'src/app/services/breakpoint-observer.service';
import { UserAccountComponent }      from 'src/app/build/builder-utility/dialog/user-account/user-account.component';


@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  /** All used FontAwesome icons in the NavBarComponent. */
  faBars = faBars;
  faUser = faUser;
  /** The color for a button's Angular Material ripple. */
  rippleColor = '#9db66b';
  /** Emits an event when the sidenav button is clicked in the nav bar and toggles
   * the sidenav itself. */
  @Output('sidenavToggle') sidenavToggle = new EventEmitter<any>();
  /** The top application title property from the app-config file to be shown on
   * the Builder's home button. */
  title: string;

  
  /**
   * Constructor for the NavBarComponent.
   * @param appService The IM Builder top level service.
   */
  constructor(private appService: AppService, private authService: AuthService,
  private dialog: MatDialog, private logger: CommonLoggerService, private screenSizeService: BreakpointObserverService) {

  }


  /**
   * An observable of a boolean type of whether the current user is currently logged
   * into the application.
   */
  get isLoggedIn(): Observable<boolean> {
    return this.authService.userAuthenticated$;
  }

  /**
   * Getter for the application configuration JSON object.
   */
  get appConfig(): IM.AppConfig { return this.appService.appConfigObj; }

  /**
  * Creates a dialog config object and sets its width & height properties based
  * on the current screen size.
  * @returns An object to be used for creating a dialog with its initial, min, and max
  * height and width conditionally.
  */
  private createDialogConfig(dialogData?: any): MatDialogConfig {

    var isMobile = this.screenSizeService.isMobile;

    return {
      data: dialogData ? dialogData : null,
      disableClose: true,
      panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
      height: isMobile ? "100vh" : "850px",
      width: isMobile ? "100vw" : "875px",
      minHeight: isMobile ? "100vh" : "20vw",
      minWidth: isMobile ? "100vw" : "875px",
      maxHeight: isMobile ? "100vh" : "95vh",
      maxWidth: isMobile ? "100vw" : "70vw"
    }
  }

  /**
   * Uses the auth service to log the user out of this session.
   */
  logoutUser(): void {
    this.authService.signOut();
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
   */
  ngOnInit(): void {
    this.logger.print('info', 'Navbar initialization.');
    this.title = this.appService.appConfigObj.title;
  }

  /**
   * Emits an event to the SideNav component when the sidenav button is toggled.
   */
  onToggleSidenav(): void {
    this.sidenavToggle.emit();
  }

  /**
   * Open the user account dialog.
   */
  openUserAccountDialog(): void {

    var userAccountDialog: MatDialogRef<UserAccountComponent, any> = this.dialog.open(
      UserAccountComponent, this.createDialogConfig()
    );
  }

}
