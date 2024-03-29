import { NgModule }                 from '@angular/core';
import { RouterModule,
          Routes }                  from '@angular/router';

import { StoryComponent }           from '@OpenWaterFoundation/common/ui/story';

import { BuildComponent }           from './build/build.component';
import { ConfirmAccountComponent }  from './user-account/sign-up/confirm-account/confirm-account.component';
import { ContentPageComponent }     from './content-page/content-page.component';
import { ForgotPasswordComponent }  from './user-account/forgot-password/forgot-password.component';
import { SignInComponent }          from './user-account/sign-in/sign-in.component';
import { SignUpMainPageComponent }  from './user-account/sign-up/sign-up-main-page/sign-up-main-page.component';
import { NotFoundComponent }        from './not-found/not-found.component';

import { AuthGuardService }         from './services/auth-guard.service';


const routes: Routes = [
  { path: '', redirectTo: 'content-page/home', canActivate: [AuthGuardService], pathMatch: 'full' },
  { path: 'login', component: SignInComponent },
  { path: 'signup', component: SignUpMainPageComponent },
  { path: 'confirm-account', component: ConfirmAccountComponent },
  { path: 'forgot', component: ForgotPasswordComponent },
  { path: 'home', redirectTo: 'content-page/home', canActivate: [AuthGuardService] },
  { path: 'content-page/:markdownFilename', component: ContentPageComponent, canActivate: [AuthGuardService] },
  { path: 'build/:builderId', component: BuildComponent, canActivate: [AuthGuardService] },
  { path: 'story/:id', component: StoryComponent, canActivate: [AuthGuardService] },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
