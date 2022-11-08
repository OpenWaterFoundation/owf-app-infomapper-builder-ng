import { Component,
          EventEmitter,
          OnInit,
          Output }             from '@angular/core';

import { faBars }              from '@fortawesome/free-solid-svg-icons';

import { CommonLoggerService } from '@OpenWaterFoundation/common/services';
import { AppService }          from '../../services/app.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  /** All used FontAwesome icons in the NavBarComponent. */
  faBars = faBars;
  /** Emits an event when the sidenav button is clicked in the nav bar and toggles
   * the sidenav itself. */
  @Output('sidenavToggle') sidenavToggle = new EventEmitter<any>();
  /** The top application title property from the app-config file. */
  title: string;

  
  /**
   * Constructor for the NavBarComponent.
   * @param appService The IM Builder top level service.
   */
  constructor(private appService: AppService, private logger: CommonLoggerService) {
  }


  /**
   * Getter for the application configuration JSON object.
   */
  get appConfig(): any { return this.appService.appConfigObj; }

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
