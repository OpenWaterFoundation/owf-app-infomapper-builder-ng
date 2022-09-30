import { Component,
          Input,
          Output,
          OnInit, 
          EventEmitter } from '@angular/core';
import { FormGroup }     from '@angular/forms';


@Component({
  selector: 'datastore-config',
  templateUrl: './datastore-config.component.html',
  styleUrls: ['./datastore-config.component.scss']
})
export class DatastoreConfigComponent implements OnInit {

  /** The top level form for the InfoMapper Builder app. */
  @Input('appBuilderForm') appBuilderForm: FormGroup;
  /** The custom & built-in error messages to be displayed under a form with an error. */
  formErrorMessages = {
    required: 'Required'
  }
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the basin name. */
  @Output('updateTitleInput') updateTitleInput = new EventEmitter<string>();


  constructor() { }


  ngOnInit(): void {
  }

  /**
   * Called after each key press by the user in the name field.
   */
   titleInput(): void {
    this.updateTitleInput.emit(this.appBuilderForm.get('datastoreFG.name').value);
  }

}
