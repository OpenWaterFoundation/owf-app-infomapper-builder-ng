import { NgModule }             from '@angular/core';
import { RouterModule,
          Routes }              from '@angular/router';

import { StoryComponent }       from '@OpenWaterFoundation/common/ui/story';

import { BuildComponent }       from './build/build.component';
import { ContentPageComponent } from './content-page/content-page.component';
import { SignInComponent }      from './sign-in/sign-in.component';


const routes: Routes = [
  { path: 'home', redirectTo: 'content-page/home' },
  // { path: '', redirectTo: 'content-page/home', pathMatch: 'full' },
  { path: '', component: SignInComponent },
  { path: 'content-page/:markdownFilename', component: ContentPageComponent },
  { path: 'build/:builderId', component: BuildComponent },
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
