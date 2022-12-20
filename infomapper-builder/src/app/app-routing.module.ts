import { NgModule }             from '@angular/core';
import { RouterModule,
          Routes }              from '@angular/router';

import { StoryComponent }       from '@OpenWaterFoundation/common/ui/story';

import { BuildComponent }       from './build/build.component';
import { ContentPageComponent } from './content-page/content-page.component';
import { AuthGuardService }            from './services/auth-guard.service';
import { SignInComponent }      from './sign-in/sign-in.component';


const routes: Routes = [
  { path: '', redirectTo: 'content-page/home', canActivate: [AuthGuardService], pathMatch: 'full' },
  { path: 'login', component: SignInComponent },
  { path: 'home', redirectTo: 'content-page/home', canActivate: [AuthGuardService] },
  { path: 'content-page/:markdownFilename', component: ContentPageComponent, canActivate: [AuthGuardService] },
  { path: 'build/:builderId', component: BuildComponent, canActivate: [AuthGuardService] },
  { path: 'story/:id', component: StoryComponent, canActivate: [AuthGuardService] }
  // TODO: 2022-12-20 - jpkeahey - Add not found component.
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
