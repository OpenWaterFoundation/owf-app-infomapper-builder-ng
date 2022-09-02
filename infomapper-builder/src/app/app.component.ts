import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title }     from '@angular/platform-browser';

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'InfoMapper Builder';


  constructor(private titleService: Title, private appService: AppService,
  @Inject(DOCUMENT) private document: Document) {}


  get appConfig(): any { return this.appService.appConfigObj; }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.setFavicon();
  }

  /**
   * Dynamically uses the path to a user given favicon, or uses the default if no
   * property in the app-config is detected.
   */
   private setFavicon(): void {

    if (this.appConfig.favicon)
      this.appService.setFaviconPath(this.appConfig.favicon);
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
}
