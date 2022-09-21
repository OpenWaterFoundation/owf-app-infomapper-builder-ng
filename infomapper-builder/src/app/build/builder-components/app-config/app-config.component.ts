import { Component,
          EventEmitter,
          Input,
          OnInit, 
          Output}   from '@angular/core';
import { FormGroup } from '@angular/forms';


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


  constructor() {

  }


  ngOnInit(): void {
    this.populateFromBusinessObject();
  }

  private populateFromBusinessObject(): void {
    this.updateTitleInput.emit('');
  }

  /**
   * Called after each key press by the user in the title field.
   */
  titleInput(): void {
    this.updateTitleInput.emit(this.appBuilderForm.get('appConfigFG.title').value);
  }

}
