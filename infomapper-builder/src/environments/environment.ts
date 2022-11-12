// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --configuration production` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  cognito: {
    userPoolId: 'us-west-2_oIuEME4cI',
    userPoolWebClientId: '2nd68j4v2dp114bp72e2vs9cv4',
    identityPoolId: 'us-west-2:c02c3e7e-a265-4c35-b2ff-d2bce1e33f8a',
    identityPoolRegion: 'us-west-2',
    region: 'us-west-2'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
