import { Component,
          EventEmitter,
          OnDestroy,
          OnInit,
          Output }             from '@angular/core';

import { Subject }             from 'rxjs';

import { CommonLoggerService } from '@OpenWaterFoundation/common/services';
import { faBookOpen,
          faFileLines,
          faGaugeHigh }        from '@fortawesome/free-solid-svg-icons';

import { AppService }          from 'src/app/app.service';


@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit, OnDestroy {

  /** Subject that is completed when this component is destroyed. */
  destroyed = new Subject<void>();
  /** Emits an event when either a Main or SubMenu is clicked and closes the sidenav. */
  @Output('sidenavClose') sidenavClose = new EventEmitter();
  /** All used icons in the SideNavComponent. */
  faBookOpen = faBookOpen;
  faFileLines = faFileLines;
  faGaugeHigh = faGaugeHigh;


  /**
   * 
   * @param appService The InfoMapper app service with globally set variables from
   * configuration files and other useful top level methods.
   * @param logger Logger from the Common package for debugging and testing.
   */
  constructor(private appService: AppService, private logger: CommonLoggerService) {
  }


  /**
   * 
   */
  get appConfig(): any { return this.appService.appConfigObj; }

  ngOnInit(): void {
    this.logger.print('info', 'Sidenav initialization.');
  }

  /**
   * Called once before the component instance is destroyed.
   */
  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  onSidenavClose(): void {
    this.sidenavClose.emit();
  }

}
