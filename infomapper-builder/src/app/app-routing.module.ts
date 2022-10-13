import { NgModule }             from '@angular/core';
import { RouterModule,
          Routes }              from '@angular/router';

import { StoryComponent }       from '@OpenWaterFoundation/common/ui/story';

// import { BuildComponent }       from './build/build.component';
import { BuildFlatComponent }   from './build-flat/build-flat/build-flat.component';
import { ContentPageComponent } from './content-page/content-page.component';


const routes: Routes = [
  { path: 'home', redirectTo: 'content-page/home' },
  { path: '', redirectTo: 'content-page/home', pathMatch: 'full' },
  { path: 'content-page/:markdownFilename', component: ContentPageComponent },
  { path: 'build-flat/:builderId', component: BuildFlatComponent },
  // { path: 'build/:builderId', component: BuildComponent },
  { path: 'story/:id', component: StoryComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
