import { Injectable }        from '@angular/core';
import { HttpClient }        from '@angular/common/http';
import { FormGroup }         from '@angular/forms';
import { catchError,
          first,
          Observable,
          of,
          Subscriber }       from 'rxjs';

import { CommonLoggerService,
          OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM               from '@OpenWaterFoundation/common/services';


@Injectable({
  providedIn: 'root'
})
export class AppService {

  /** The application configuration object read from the `app-config.json` file. */
  private appConfig: IM.AppConfig | undefined;
  /** The hard-coded string of the name of the application config file. It is readonly,
   * because it must be named app-config.json by the user. */
  readonly appConfigFile = 'app-config.json';
  /** A string representing the path to the correct assets directory for the InfoMapper.
   * The InfoMapper assumes a user will supply their own user-defined config file
   * under assets/app. If not, this string will be changed to 'assets/app-default'
   * and the default InfoMapper set up will be used instead. */
  appPath = 'assets/app/';
  /** The object used to create the final app configuration file. (?) */
  private builderJSON: IM.AppConfig = { title: '', homePage: '', version: '' };
  /** The hard-coded string of the path to the default icon path that will be used
   * for the website if none is given. */
  readonly defaultFaviconPath = 'favicon.ico';
  /** The path to the user-provided favicon .ico file. */
  faviconPath: string;
  /** Boolean representing if a favicon path has been provided by the user. */
  FAVICON_SET = false;
  /** The initial website title to be displayed in the browser tab. */
  readonly mainWebsiteTitle = 'InfoMapper Builder';
  /** If each node in the tree has been saved yet (true) or not (false). */
  nodeSaved = {};

  
  /**
   * 
   * @param http 
   */
  constructor(private http: HttpClient, private logger: CommonLoggerService,
  private commonService: OwfCommonService) { }


  /**
   * Getter for the application configuration object read from the `app-config.json` file.
   */
  get appConfigObj(): IM.AppConfig {
    return this.appConfig;
  }

  /**
   * Getter for the entire AppConfig object, used to write to a JSON file as the
   * `app-config.json`.
   */
  get fullBuilderJSON(): IM.AppConfig {
    return this.builderJSON;
  }

  /**
   * Builds the path needed for an HTTP GET request for either a local file or URL,
   * and does so whether given an absolute or relative path in a configuration or
   * template file.
   * @param pathType A Path enum representing what kind of path that needs to be
   * built.
   * @param path An optional string with the path or URL wanting to be built. No
   * path will return the home page path.
   */
   buildPath(pathType: IM.Path, path?: string): string {

    if (path) {
      // If a URL is given, just return so the http GET request can be performed.
      if (path.startsWith('https') || path.startsWith('http') || path.startsWith('www')) {
        return path;
      } else {

        // Depending on the pathType, build the correct path.
        switch(pathType) {
          case IM.Path.cPP:
            return this.getAppPath() + this.getContentPathFromId(path);
          // case IM.Path.gLGJP:
          //   return this.getAppPath() + this.getGeoJSONBasePath() + arg[0];
          // case IM.Path.eCP:
          //   return this.getAppPath() + this.getMapConfigPath() + arg[0];
          // case IM.Path.cP:
          // case IM.Path.csvPath:
          // case IM.Path.dVP:
          // case IM.Path.dUP:
          // case IM.Path.dP:
          // case IM.Path.iGP:
          // case IM.Path.sMP:
          // case IM.Path.sIP:
          // case IM.Path.raP:
          // case IM.Path.rP:
          //   if (pathType === IM.Path.dP) {
          //     this.setFullMarkdownPath(this.getAppPath() + this.formatPath(arg[0], pathType));
          //   }
          //   return this.getAppPath() + this.formatPath(arg[0], pathType);
          // case IM.Path.bSIP:
          //   return this.formatPath(arg[0], pathType);
          // case IM.Path.mP:
          //   if (arg[0].startsWith('/')) {
          //     return this.getAppPath() + this.formatPath(arg[0], pathType);
          //   } else {
          //     return this.getFullMarkdownPath() + this.formatPath(arg[0], pathType);
          //   }
          default:
            return '';
        }
      }
    }
    // If no path is provided, default to the home page.
    else {
      return this.getAppPath() + this.getHomePage();
    }
    
  }

  /**
   * 
   * @param node 
   */
  private confirmAllMainMenusExist(node: IM.TreeNodeData): void {
    if (!this.builderJSON.mainMenu) {
      this.builderJSON.mainMenu = [{}];
    }
    for (let index = 0; index <= node.index; ++index) {
      if (!this.builderJSON.mainMenu[index]) {
        this.builderJSON.mainMenu.push({});
      }
    }
  }

  /**
   * 
   * @param node 
   */
  private confirmAllSubMenusExist(node: IM.TreeNodeData): void {
    
    // Check if the empty Main Menus exist and create the ones that don't yet.
    if (!this.builderJSON.mainMenu) {
      this.builderJSON.mainMenu = [{}];
    }
    for (let pIndex = 0; pIndex <= node.parentIndex; ++pIndex) {
      if (!this.builderJSON.mainMenu[pIndex]) {
        this.builderJSON.mainMenu.push({});
      }
    }

    // Check if the empty SubMenus exist and create the ones that don't yet.
    if (!this.builderJSON.mainMenu[node.parentIndex].menus) {
      this.builderJSON.mainMenu[node.parentIndex].menus = [{}];
    }
    for (let index = 0; index <= node.index; ++index) {
      if (!this.builderJSON.mainMenu[node.parentIndex].menus[node.index]) {
        this.builderJSON.mainMenu[node.parentIndex].menus.push({});
      }
    }
  }

  /**
   * @returns The boolean representing if a user provided favicon path has been provided.
   */
  faviconSet(): boolean { return this.FAVICON_SET; }

  /**
   * @returns The path to the application configuration file.
   */
  getAppConfigFile(): string {
    return this.appConfigFile;
  }

  /**
   * @returns Either `assets/app/` if a user-provided configuration file is given,
   * or the default `assets/app-default/` for the upper level assets path.
   */
  getAppPath(): string {
    return this.appPath;
  }

  /**
   * Iterates through all menus and sub-menus in the `app-config.json` file and
   * determines 
   * @param id The geoLayerId to compare with each menu id property.
   * @returns The markdownFile (contentPage) path found that matches the given geoLayerId.
   */
  getContentPathFromId(id: string) {

    for (let i = 0; i < this.appConfig.mainMenu.length; i++) {
      if (this.appConfig.mainMenu[i].menus) {
        for (let menu = 0; menu < this.appConfig.mainMenu[i].menus.length; menu++) {
          if (this.appConfig.mainMenu[i].menus[menu].id === id)
            return this.appConfig.mainMenu[i].menus[menu].markdownFile;
        }
      } else {
        if (this.appConfig.mainMenu[i].id === id)
          return this.appConfig.mainMenu[i].markdownFile;
      }
    }
    // Return the homePage path by default. Check to see if it's an absolute path first.
    if (id.startsWith('/')) {
      return id.substring(1);
    }
    // If it doesn't, use the path relative to the home page.
    else {
      var arr: string[] = this.appConfig.homePage.split('/');
      return arr.splice(0, arr.length - 1).join('/').substring(1) + '/' + (id.startsWith('/') ? id.substring(1) : id);
    }
  }

  /**
   * @returns The application's default favicon path.
   */
  getDefaultFaviconPath(): string { return this.defaultFaviconPath; }

  /**
   * @returns Either the first '/' removed from an absolute path or the relative 
   * path to a favicon image.
   */
  getFaviconPath(): string {
    if (this.faviconPath.startsWith('/')) {
      return this.faviconPath.substring(1);
    } else return this.faviconPath;
  }

  /**
   * @returns the homePage property in the app-config file without the first '/' slash.
   */
  getHomePage(): string {
    if (!this.appConfig) {
      return '';
    }
    if (this.appConfig.homePage) {
      if (this.appConfig.homePage[0] === '/')
        return this.appConfig.homePage.substring(1);
      else
        return this.appConfig.homePage;
    }
    else throw new Error("The 'homePage' property in the app configuration file not set. Please set the path to the home page.")
  }

  /**
   * Read data asynchronously from a file or URL and return it as a JSON object.
   * @param path The path or URL to the file needed to be read
   * @returns The JSON retrieved from the host as an Observable
   */
  getJSONData(path: string, type?: IM.Path, id?: string): Observable<any> {
  
    return this.http.get<any>(path)
    .pipe(catchError(this.handleError<any>(path, type, id)));
  }

  /**
   * @returns The main website title to be displayed in the browser tab.
   */
  getMainWebsiteTitle(): string {
    return this.mainWebsiteTitle;
  }

  /**
   * Read data asynchronously from a file or URL and return it as plain text.
   * @param path The path to the file to be read, or the URL to send the GET request
   * @param type Optional type of request sent, e.g. IM.Path.cPP. Used for error handling and messaging
   * @param id Optional app-config id to help determine where exactly an error occurred
   */
  getPlainText(path: string, type?: IM.Path, id?: string): Observable<any> {
    // This next line is important, as it tells our response that it needs to return
    // plain text, not a default JSON object.
    const obj: Object = { responseType: 'text' as 'text' };
    return this.http.get<any>(path, obj)
    .pipe(catchError(this.handleError<any>(path, type, id)));
  }

  /**
   * Handles the HTTP operation that failed, and lets the app continue by returning 
   * @param path - Name of the path used that failed.
   * @param type - Optional type of the property error. Was it a home page, template, etc.
   * @param result - Optional value to return as the observable result.
   */
  private handleError<T> (path: string, type?: IM.Path, id?: string, result?: T) {
    return (error: any): Observable<T> => {

      console.error('An error occurred!');
      return of(result as T);
    };
  }

  /**
   * Checks if the current node's form has been saved before.
   * @param nodeLevel The tree node level.
   * @returns True if the node config has been previously saved.
   */
  hasNodeBeenSaved(nodeLevel: string): boolean {
    return this.nodeSaved[nodeLevel];
  }

  /**
   * Asynchronously loads the application configuration file and sets the necessary
   * variables that describes what kind of application is being created:
   *   A user-provided app.
   *   The default app.
   *   The minimal default app.
   */
  loadConfigFiles(): Observable<any> {

    return new Observable((subscriber: Subscriber<any>) => {

      this.urlExists(this.getAppPath() + this.getAppConfigFile()).pipe(first()).subscribe({
        next: () => {
          // If it exists, asynchronously retrieve its JSON contents into a JavaScript
          // object and assign it as the appConfig.
          this.getJSONData(this.getAppPath() + this.getAppConfigFile(), IM.Path.aCP)
          .subscribe((appConfig: IM.AppConfig) => {
            this.setAppConfig(appConfig);
            this.commonService.setAppConfig(appConfig);

            subscriber.complete();
          });
        },
        error: (error: any) => {
          this.logger.print('error', 'Configuration file "app-config.json" not provided, ' +
          'and is required to create an InfoMapper application.');
          throw new Error();
        }
      });
    });
  }

  /**
   * Sanitizes the markdown syntax by checking if image links are present, and replacing
   * them with the full path to the image relative to the markdown file being displayed.
   * This eases usability so that just the name and extension of the file can be used
   * e.g. ![Waldo](waldo.png) will be converted to ![Waldo](full/path/to/markdown/file/waldo.png).
   * @param doc The documentation string retrieved from the markdown file.
   */
  sanitizeDoc(doc: string, pathType: IM.Path): string {
    // Needed for a smaller scope when replacing the image links
    var _this = this;
    if (/!\[(.*?)\]\(/.test(doc)) {
      
      // Match ![Any amount of text](Any amount of text)
      var allImageLinks: RegExpMatchArray | null = doc.match(/!\[(.*?)\]\((.*?)\)/g);

      if (allImageLinks) {
        for (let imageLink of allImageLinks) {
          if (imageLink.startsWith('](https') || imageLink.startsWith('](http') || imageLink.startsWith('](www')) {
            continue;
          } else {
            doc = doc.replace(imageLink, function(word) {
              // Set the beginning of the image link so it can be prepended later.
              var imageLinkStart = word.substring(0, word.indexOf('(') + 1);
              // Get the text from inside the image link's parentheses.
              var innerParensContent = word.substring(word.indexOf('(') + 1, word.length - 1);
              // Return the formatted full markdown path with the corresponding bracket and parentheses.
              return imageLinkStart + _this.buildPath(pathType, innerParensContent) + ')';
            });
  
          }
        }
      }
      
    }

    return doc;
  }

  /**
   * Sets the globally used @var appConfig for access to the app's configuration
   * settings.
   * @param appConfig The entire application configuration read in from the app-config
   * file as an object.
   */
  setAppConfig(appConfig: IM.AppConfig): void { this.appConfig = appConfig; }

  /**
   * 
   * @param resultForm 
   * @param node 
   */
  setBuilderObject(resultForm: FormGroup, node: IM.TreeNodeData): void {

    if (node.level === 'Application') {
      Object.assign(this.builderJSON, resultForm);
      this.nodeSaved['Application'] = true;
    } else if (node.level === 'Main Menu') {
      this.confirmAllMainMenusExist(node);
      Object.assign(this.builderJSON.mainMenu[node.index], resultForm);
      this.nodeSaved['Main Menu ' + node.index] = true;
    } else if (node.level === 'SubMenu') {
      this.confirmAllSubMenusExist(node);
      Object.assign(this.builderJSON.mainMenu[node.parentIndex].menus[node.index], resultForm);
      this.nodeSaved['SubMenu ' + node.parentIndex + ',' + node.index] = true;
    }
  }

  /**
   * Sets the app service @var faviconPath to the user-provided path given in the
   * app configuration file @param path The path to the user-provided favicon image.
   */
  setFaviconPath(path: string): void { this.faviconPath = path; }

  /**
   * Sets the FAVICON_SET boolean to true after a user-provided favicon path has
   * been set, so it's only set once.
   */
  setFaviconTrue(): void { this.FAVICON_SET = true; }

  /**
   * As of right now, this GETs a full file, and might be slow with large files.
   * Its only purpose is to try to GET a URL, and throw an error if unsuccessful.
   * Determines if a user-defined app/ file is given, or if the app-default should
   * be used.
   * @param url The URL to try to GET from
   */
  urlExists(url: string): Observable<any> {
    return this.http.get(url);
  }

  /**
   * Determines if the ID in the URL exists in any mainMenu or subMenu id from the
   * app-config.json.
   * @param ID The ID taken from the current URL.
   * @returns True if the ID from the URL matches any id in the app-config object,
   * and false otherwise.
   */
  validURLConfigID(ID: string): boolean {

    if (ID === 'home') {
      return true;
    }

    for (let mainMenu of this.appConfig?.mainMenu) {
      // If subMenus exist.
      if (mainMenu.menus) {
        for (let subMenu of mainMenu.menus) {
          if (subMenu.id === ID) {
            return true;
          }
        }
      }
      // If no subMenus exist.
      else {
        if (mainMenu.id === ID) {
          return true;
        }
      }
    }
    return false;
  }

}
