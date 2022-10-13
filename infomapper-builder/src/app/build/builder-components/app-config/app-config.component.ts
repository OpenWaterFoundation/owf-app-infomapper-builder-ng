import { Component,
          EventEmitter,
          Input,
          OnInit, 
          Output}       from '@angular/core';
import { AbstractControl,
          FormGroup }   from '@angular/forms';

import { AppService }   from 'src/app/app.service';
import { BuildManager } from '../../build-manager';


@Component({
  selector: 'app-config',
  templateUrl: './app-config.component.html',
  styleUrls: ['./app-config.component.scss', '../shared-styles.scss']
})
export class AppConfigComponent implements OnInit {

  /** The top level form for the InfoMapper Builder app. */
  @Input('appBuilderForm') appBuilderForm: FormGroup;
  /** Singleton BuildManager instance to uniquely add different nodes to the
   * displayed tree. */
  buildManager: BuildManager = BuildManager.getInstance();
  /** The custom & built-in error messages to be displayed under a form with an error. */
  formErrorMessages = {
    required: 'Required'
  }
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the basin name. */
  @Output('updateTitleInput') updateTitleInput = new EventEmitter<string>();


  /**
   * 
   * @param appService 
   */
  constructor() {

  }


  ngOnInit(): void {

    if (this.buildManager.hasNodeBeenSaved('0')) {
      this.populateFromBuilderJSON();
    } else {
      this.setRequiredDefaults();
    }
  }

  /**
   * 
   * @param control The FormControl that will be checked for errors.
   * @returns An array with each error key as a string.
   */
  formErrors(control: AbstractControl): string[] {
    return control.errors ? Object.keys(control.errors) : [];
  }

  /**
   * The app configuration form has been previously saved, so update the form
   * fields with that data.
   */
  private populateFromBuilderJSON(): void {

    let fullBuilderJSON = this.buildManager.fullBuilderJSON;

    this.updateTitleInput.emit(fullBuilderJSON.title);

    this.appBuilderForm.get('appConfigFG.title').setValue(fullBuilderJSON.title);
    this.appBuilderForm.get('appConfigFG.homePage').setValue(fullBuilderJSON.homePage);
    this.appBuilderForm.get('appConfigFG.version').setValue(fullBuilderJSON.version);
    this.appBuilderForm.get('appConfigFG.dataUnitsPath').setValue(fullBuilderJSON.dataUnitsPath);
    this.appBuilderForm.get('appConfigFG.favicon').setValue(fullBuilderJSON.favicon);
    this.appBuilderForm.get('appConfigFG.googleAnalyticsTrackingId').setValue(fullBuilderJSON.googleAnalyticsTrackingId);
  }

  /**
   * 
   */
  private setRequiredDefaults(): void {

    let fullBuilderJSON = this.buildManager.fullBuilderJSON;

    let titleControl = this.appBuilderForm.get('appConfigFG.title')
    titleControl.setValue(fullBuilderJSON.title);
    titleControl.markAsTouched();
    
    let versionControl = this.appBuilderForm.get('appConfigFG.version')
    versionControl.setValue(fullBuilderJSON.version);
    versionControl.markAsTouched();
  }

  /**
   * Called after each key press by the user in the title field.
   */
  titleInput(): void {
    this.updateTitleInput.emit(this.appBuilderForm.get('appConfigFG.title').value);
  }

}
