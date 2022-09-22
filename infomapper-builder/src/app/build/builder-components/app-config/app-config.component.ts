import { Component,
          EventEmitter,
          Input,
          OnInit, 
          Output}     from '@angular/core';
import { FormGroup }  from '@angular/forms';

import { AppService } from 'src/app/app.service';


@Component({
  selector: 'app-config',
  templateUrl: './app-config.component.html',
  styleUrls: ['./app-config.component.scss']
})
export class AppConfigComponent implements OnInit {

  /** The top level form for the InfoMapper Builder app. */
  @Input('appBuilderForm') appBuilderForm: FormGroup;
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the basin name. */
  @Output('updateTitleInput') updateTitleInput = new EventEmitter<string>();


  constructor(private appService: AppService) {

  }


  ngOnInit(): void {

    if (this.appService.hasNodeBeenSaved('Application')) {
      this.populateFromBuilderJSON();
    }
  }

  /**
   * The app configuration form has been previously saved, so update the form
   * fields with that data.
   */
  private populateFromBuilderJSON(): void {

    var fullBuilderJSON = this.appService.fullBuilderJSON;

    this.updateTitleInput.emit(fullBuilderJSON.title);

    this.appBuilderForm.get('appConfigFG.title').setValue(fullBuilderJSON.title);
    this.appBuilderForm.get('appConfigFG.homePage').setValue(fullBuilderJSON.homePage);
    this.appBuilderForm.get('appConfigFG.version').setValue(fullBuilderJSON.version);
    this.appBuilderForm.get('appConfigFG.dataUnitsPath').setValue(fullBuilderJSON.dataUnitsPath);
    this.appBuilderForm.get('appConfigFG.favicon').setValue(fullBuilderJSON.favicon);
    this.appBuilderForm.get('appConfigFG.googleAnalyticsTrackingId').setValue(fullBuilderJSON.googleAnalyticsTrackingId);
  }

  /**
   * Called after each key press by the user in the title field.
   */
  titleInput(): void {
    this.updateTitleInput.emit(this.appBuilderForm.get('appConfigFG.title').value);
    
  }

}
