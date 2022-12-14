import { Component,
          Inject,
          OnInit }        from '@angular/core';
import { DOCUMENT }       from '@angular/common';
import { Title }          from '@angular/platform-browser';
import { Observable }     from 'rxjs';

import { AppService }     from './services/app.service';
import * as IM            from '@OpenWaterFoundation/common/services';
import { AuthService }    from './services/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {


  /**
   * 
   * @param titleService 
   * @param appService 
   * @param authService 
   * @param document 
   */
  constructor(private titleService: Title, private appService: AppService,
  private authService: AuthService, @Inject(DOCUMENT) private document: Document) {}


  /**
   * The application configuration object from the `app-config.json` file.
   */
  get appConfig(): IM.AppConfig { return this.appService.appConfigObj; }
  /**
   * Uses the AuthService to check if current user is logged in to the app.
   */
  get isLoggedIn(): Observable<boolean> { return this.authService.userAuthenticated$ }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
   */
  ngOnInit(): void {
    this.setWebsiteTitle();
    this.setFavicon();
  }

  /**
   * Dynamically uses the path to a user given favicon, or uses the default if no
   * property in the app-config is detected.
   */
   private setFavicon(): void {

    if (this.appConfig.favicon) {
      this.appService.setFaviconPath(this.appConfig.favicon);
    }
    else {
      // Favicon app configuration property not given. Use a default.
      this.document.getElementById('appFavicon').setAttribute('href', this.appService.getDefaultFaviconPath());
      return;
    }
    
    // Set the favicon the first time, but not on subsequent page loads.
    if (!this.appService.faviconSet()) {
      this.document.getElementById('appFavicon')
      .setAttribute('href', this.appService.getFaviconPath());

      this.appService.setFaviconTrue();
    }
  }

  /**
   * Sets the initial website title to the static 'InfoMapper Builder' string.
   */
  private setWebsiteTitle(): void {
    this.titleService.setTitle(this.appService.getMainWebsiteTitle());
  }
}
