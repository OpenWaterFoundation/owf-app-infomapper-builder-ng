import { APP_INITIALIZER,
          NgModule }                from '@angular/core';
import { BrowserModule }            from '@angular/platform-browser';
import { BrowserAnimationsModule }  from '@angular/platform-browser/animations';
import { HttpClient,
          HttpClientModule }        from '@angular/common/http';
import { FlexLayoutModule }         from '@angular/flex-layout';
import { FormsModule,
          ReactiveFormsModule }     from '@angular/forms';

import { CdkStepperModule }         from '@angular/cdk/stepper';
import { CdkTableModule }           from '@angular/cdk/table';
import { CdkTreeModule }            from '@angular/cdk/tree';
import { DragDropModule }           from '@angular/cdk/drag-drop';
import { PortalModule }             from '@angular/cdk/portal';
import { ScrollingModule }          from '@angular/cdk/scrolling';
import { MatButtonModule }          from '@angular/material/button';
import { MatCardModule }            from '@angular/material/card';
import { MatDialogModule }          from '@angular/material/dialog';
import { MatDividerModule }         from '@angular/material/divider';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatIconModule }            from '@angular/material/icon';
import { MatInputModule }           from '@angular/material/input';
import { MatListModule }            from '@angular/material/list';
import { MatMenuModule }            from '@angular/material/menu';
import { MatSelectModule }          from '@angular/material/select';
import { MatSidenavModule }         from '@angular/material/sidenav';
import { MatSnackBarModule }        from '@angular/material/snack-bar';
import { MatToolbarModule }         from '@angular/material/toolbar';
import { MatTooltipModule }         from '@angular/material/tooltip';
import { MatTreeModule }            from '@angular/material/tree';

import { FontAwesomeModule }        from '@fortawesome/angular-fontawesome';
import { AngularFullpageModule }    from '@fullpage/angular-fullpage';

import { CookieModule }             from 'ngx-cookie';
import { LoggerModule,
          NgxLoggerLevel }          from 'ngx-logger';
import { ShowdownModule }           from 'ngx-showdown';

import { Observable }               from 'rxjs/internal/Observable';

import { AppRoutingModule }         from './app-routing.module';

import { AppComponent }             from './app.component';
import { AppConfigComponent }       from './build/builder-components/app-config/app-config.component';
import { BuildComponent }           from './build/build.component';
import { BrowseDialogComponent }    from './build/builder-utility/dialog/browse-dialog/browse-dialog.component';
import { ConfigDialogComponent }    from './build/builder-utility/dialog/config-dialog/config-dialog.component';
import { ContentPageComponent }     from './content-page/content-page.component';
import { DatastoreConfigComponent } from './build/builder-components/datastore-config/datastore-config.component';
import { HomeComponent }            from './home/home.component';
import { MainMenuConfigComponent }  from './build/builder-components/main-menu-config/main-menu-config.component';
import { NavBarComponent }          from './navigation/nav-bar/nav-bar.component';
import { NavBarMenuComponent }      from './navigation/nav-bar/nav-bar-menu/nav-bar-menu.component';
import { NodeMenuComponent }        from './build/builder-utility/node-menu/node-menu.component';
import { SideNavComponent }         from './navigation/side-nav/side-nav.component';
import { SignInComponent }          from './sign-in/sign-in.component';
import { SubMenuConfigComponent }   from './build/builder-components/sub-menu-config/sub-menu-config.component';

import { AppService }               from './services/app.service';

import { CheckElementPipe }         from './pipes/check-element.pipe';
import { ConvertFormNamePipe }      from './pipes/convert-form-name.pipe';
import { CheckTreeNodePipe }        from './pipes/check-tree-node.pipe';

// Showdown, to convert markdown to HTML.
import * as Showdown                from 'showdown';


const classMap: any = {
  h1: 'showdown_h1',
  h2: 'showdown_h2',
  ul: 'ui list',
  li: 'ui item',
  table: 'showdown_table',
  td: 'showdown_td',
  th: 'showdown_th',
  tr: 'showdown_tr',
  p: 'showdown_p',
  pre: 'showdown_pre'
}

const bindings = Object.keys(classMap)
  .map(key => ({
    type: 'output',
    regex: new RegExp(`(<${key}>|<${key} (.*?)>)`, 'g'),
    replace: `<${key} class="${classMap[key]}">`
  }));

const convert = new Showdown.Converter({
  extensions: [bindings]
});

/**
 * Retrieves the `app-config.json` file before the application loads, so information
 * can be ready to be used before the rest of the app starts.
 * @param appService An instance of the top-level AppService.
 * @returns An observable.
 */
function appInit(appService: AppService): () => Observable<any> {
  return () => appService.loadConfigFiles();
}


@NgModule({
  declarations: [
    AppConfigComponent,
    AppComponent,
    BuildComponent,
    BrowseDialogComponent,
    ConfigDialogComponent,
    ContentPageComponent,
    DatastoreConfigComponent,
    HomeComponent,
    MainMenuConfigComponent,
    NavBarComponent,
    NavBarMenuComponent,
    NodeMenuComponent,
    SideNavComponent,
    SignInComponent,
    SubMenuConfigComponent,

    CheckElementPipe,
    CheckTreeNodePipe,
    ConvertFormNamePipe
  ],
  imports: [
    AngularFullpageModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    FlexLayoutModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,

    LoggerModule.forRoot({
      level: NgxLoggerLevel.TRACE,
      // timestampFormat: "medium",
      colorScheme: [
        'mediumorchid',
        'teal',
        'royalblue',
        'teal',
        'orange',
        'red',
        'red'
      ]
    }),
    
    CookieModule.withOptions(),
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    PortalModule,
    ScrollingModule,

    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,

    ShowdownModule.forRoot({
      emoji: true,
      flavor: 'github',
      extensions: [bindings],
      noHeaderId: true,
      openLinksInNewWindow: true,
      parseImgDimensions: true,
      simpleLineBreaks: false,
      strikethrough: true,
      tables: true
    })
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInit,
      multi: true,
      deps: [AppService, HttpClient]
    },
    AppService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
