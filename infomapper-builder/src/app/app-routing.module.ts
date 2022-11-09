import { NgModule }             from '@angular/core';
import { RouterModule,
          Routes }              from '@angular/router';

import { StoryComponent }       from '@OpenWaterFoundation/common/ui/story';

import { BuildComponent }       from './build/build.component';
import { ContentPageComponent } from './content-page/content-page.component';
import { AuthGuard }            from './services/auth-guard.service';
import { SignInComponent }      from './sign-in/sign-in.component';


const routes: Routes = [
  { path: 'home', redirectTo: 'content-page/home' },
  { path: '', component: SignInComponent, pathMatch: 'full' },
  { path: 'content-page/:markdownFilename', component: ContentPageComponent, canActivate: [AuthGuard] },
  { path: 'build/:builderId', component: BuildComponent, canActivate: [AuthGuard] },
  { path: 'story/:id', component: StoryComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
