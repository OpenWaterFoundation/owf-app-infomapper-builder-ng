import { APP_INITIALIZER,
          NgModule }               from '@angular/core';
import { BrowserModule }           from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient,
          HttpClientModule }       from '@angular/common/http';
import { FlexLayoutModule }        from '@angular/flex-layout';
import { FormsModule,
          ReactiveFormsModule }    from '@angular/forms';

import { MatButtonModule }         from '@angular/material/button';
import { MatCardModule }           from '@angular/material/card';
import { MatDialogModule }         from '@angular/material/dialog';
import { DragDropModule }          from '@angular/cdk/drag-drop';
import { MatFormFieldModule }      from '@angular/material/form-field';
import { MatIconModule }           from '@angular/material/icon';
import { MatInputModule }          from '@angular/material/input';
import { MatListModule }           from '@angular/material/list';
import { MatMenuModule }           from '@angular/material/menu';
import { MatSelectModule }         from '@angular/material/select';
import { MatSidenavModule }        from '@angular/material/sidenav';
import { MatToolbarModule }        from '@angular/material/toolbar';
import { MatTooltipModule }        from '@angular/material/tooltip';
import { MatTreeModule }           from '@angular/material/tree';

import { FontAwesomeModule }       from '@fortawesome/angular-fontawesome';
import { AngularFullpageModule }   from '@fullpage/angular-fullpage';

import { Observable }              from 'rxjs/internal/Observable';

import { ShowdownModule }          from 'ngx-showdown';
import { LoggerModule,
          NgxLoggerLevel }         from 'ngx-logger';

import { AppRoutingModule }        from './app-routing.module';

import { AppComponent }            from './app.component';
import { AppConfigComponent }      from './build/builder-components/app-config/app-config.component';
import { BuildComponent }          from './build/build.component';
import { DialogComponent }         from './build/builder-utility/dialog/dialog.component';
import { MainMenuConfigComponent } from './build/builder-components/main-menu-config/main-menu-config.component';
import { NavBarComponent }         from './navigation/nav-bar/nav-bar.component';
import { NavBarMenuComponent }     from './navigation/nav-bar/nav-bar-menu/nav-bar-menu.component';
import { NodeMenuComponent }       from './build/builder-utility/node-menu/node-menu.component';
import { SideNavComponent }        from './navigation/side-nav/side-nav.component';
import { ContentPageComponent }    from './content-page/content-page.component';
import { AddToTreePipe }           from './pipes/add-to-tree.pipe';
import { AppService }              from './app.service';
import { CheckElementPipe }        from './pipes/check-element.pipe';

// Showdown, to convert markdown to HTML.
import * as Showdown               from 'showdown';


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
    AppComponent,
    ContentPageComponent,
    NavBarComponent,
    SideNavComponent,
    NavBarMenuComponent,
    CheckElementPipe,
    BuildComponent,
    AppConfigComponent,
    AddToTreePipe,
    MainMenuConfigComponent,
    DialogComponent,
    NodeMenuComponent
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
    
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    DragDropModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSelectModule,
    MatSidenavModule,
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
