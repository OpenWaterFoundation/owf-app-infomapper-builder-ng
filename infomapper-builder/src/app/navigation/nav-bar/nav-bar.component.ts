import { Component,
          EventEmitter,
          OnInit,
          Output }             from '@angular/core';

import { faBars }              from '@fortawesome/free-solid-svg-icons';

import * as IM                 from '@OpenWaterFoundation/common/services'
import { CommonLoggerService } from '@OpenWaterFoundation/common/services';
import { Observable }          from 'rxjs';

import { AppService }          from 'src/app/services/app.service';
import { AuthService }         from 'src/app/services/auth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  /** All used FontAwesome icons in the NavBarComponent. */
  faBars = faBars;
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
  private logger: CommonLoggerService) {
  }


  get authUsername(): Observable<string> {
    return this.authService.authUsername$;
  }

  get isLoggedIn(): Observable<boolean> {
    return this.authService.userAuthenticated$;
  }

  /**
   * Getter for the application configuration JSON object.
   */
  get appConfig(): IM.AppConfig { return this.appService.appConfigObj; }

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

}
