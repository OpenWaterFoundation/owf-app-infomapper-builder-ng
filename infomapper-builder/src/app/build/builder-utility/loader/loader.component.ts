import { Component } from '@angular/core';


@Component({
  selector: 'app-loader',
  template: `
    <mat-progress-spinner mode="indeterminate">
    </mat-progress-spinner>
  `
})
export class LoaderComponent {
  constructor() {}

}