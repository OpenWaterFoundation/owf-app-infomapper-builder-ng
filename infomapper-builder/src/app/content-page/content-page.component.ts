import { Component,
          OnInit,
          Input,
          OnDestroy }          from '@angular/core';
import { ActivatedRoute,
          ParamMap }           from '@angular/router';

// import { CommonLoggerService } from '@OpenWaterFoundation/common/services';

import { first,
          Subject,
          takeUntil}       from 'rxjs';

import { AppService }          from '../services/app.service';
import * as IM                 from '@OpenWaterFoundation/common/services';


@Component({
  selector: 'app-content-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.scss']
})
export class ContentPageComponent implements OnInit, OnDestroy {

  /** Subject that is completed when this component is destroyed. */
  destroyed = new Subject<void>();
  /** The id retrieved from the URL, originally from the app-config id menu option. */
  @Input() id: any;
  /** The Showdown config option object. Overrides the `app.module.ts` config option object. */
  showdownOptions = {
    emoji: true,
    flavor: 'github',
    noHeaderId: true,
    openLinksInNewWindow: true,
    parseImgDimensions: true,
    // This must exist in the config object and be set to false to work.
    simpleLineBreaks: false,
    strikethrough: true,
    tables: true
  }
  /** A string representing the content to be converted to HTML to display on the Home or Content Page. */
  showdownHTML = '';
  /** Boolean set to false if the URL id for this Content Page does not exist in
   * any `app-config.json` mainMenu or subMenu id. */
  validContentPageID = true;


  /**
  * @constructor ContentPageComponent.
  * @param appService The reference to the AppService injected object.
  * @param actRoute The reference to the ActivatedRoute Angular object; used with URL routing for the app.
  */
  constructor(private appService: AppService, private actRoute: ActivatedRoute) {

  }


  /**
  * Sets the showdownHTML variable string to be displayed in the template file by
  * ngx-showdown if the path to a markdown file is given. Displays a 404
  * @param markdownFilepath The full path to the home page or content page file.
  */
  public convertMarkdownToHTML(markdownFilepath: string) {

    this.appService.getPlainText(markdownFilepath, IM.Path.cPage)
      .pipe(first()).subscribe((markdownFile: any) => {
        if (markdownFile) {
          // Other options for the showdown constructor include:
          // underline
          this.showdownHTML = this.appService.sanitizeDoc(markdownFile, IM.Path.cPP);
        }

      });
  }

  /**
  * Called once on Component initialization, right after the constructor is called.
  */
  ngOnInit() {
    // When the parameters in the URL are changed the map will refresh and load
    // according to new configuration data.
    this.actRoute.paramMap.pipe(takeUntil(this.destroyed)).subscribe((paramMap: ParamMap) => {

      this.id = paramMap.get('markdownFilename');
      this.validContentPageID = this.appService.validURLConfigID(this.id);

      if (this.validContentPageID === false) {
        return;
      }

      // this.logger.print('info', 'ContentPageComponent.ngOnInit - Content Page initialization.')

      // This might not work with async calls if app-default is detected.
      var markdownFilepath: string = '';

      if (this.id === 'home') {
        markdownFilepath = this.appService.buildPath(IM.Path.hPP);
      } else {
        markdownFilepath = this.appService.buildPath(IM.Path.cPP, this.id);
      }
      this.convertMarkdownToHTML(markdownFilepath);
    });
  }


  /**
  * Called once right before this component is destroyed.
  */
  ngOnDestroy(): void {
    // Called once, before the instance is destroyed. Add 'implements OnDestroy' to the class.
    this.destroyed.next();
    this.destroyed.complete();
  }

}
