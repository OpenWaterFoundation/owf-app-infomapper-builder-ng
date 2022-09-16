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

  /**
   * 
   */
  @Input('appBuilderForm') appBuilderForm: FormGroup;
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the basin name. */
  @Output() updateTitleInput = new EventEmitter<any>();


  constructor() {

  }


  ngOnInit(): void {
  }

  titleInput(): void {
    this.updateTitleInput.emit(this.appBuilderForm.get('appConfigFG.title').value);
  }

}
