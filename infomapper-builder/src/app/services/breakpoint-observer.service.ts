import { Injectable }       from '@angular/core';
import { BreakpointObserver,
          Breakpoints, 
          BreakpointState } from '@angular/cdk/layout';


@Injectable({
  providedIn: 'root'
})
export class BreakpointObserverService {

  private _currentScreenSize: string;


  /**
   * 
   * @param breakpointObserver 
   */
  constructor(private breakpointObserver: BreakpointObserver) {
    this.initObserver();
  }


  get isMobile(): boolean {
    return (this._currentScreenSize === Breakpoints.XSmall ||
    this._currentScreenSize === Breakpoints.Small) ?
    true : false;
  }

  /**
   * 
   */
  private initObserver(): void {

    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ]).subscribe((state: BreakpointState) => {
      for (const breakpoint of Object.keys(state.breakpoints)) {
        if (state.breakpoints[breakpoint]) {
          this._currentScreenSize = breakpoint;
        }
      }
    });
  }

}