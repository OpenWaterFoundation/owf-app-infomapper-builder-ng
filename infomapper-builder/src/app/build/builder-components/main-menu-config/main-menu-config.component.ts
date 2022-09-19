import { Component,
          EventEmitter,
          Input,
          OnInit,
          Output }   from '@angular/core';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'main-menu-config',
  templateUrl: './main-menu-config.component.html',
  styleUrls: ['./main-menu-config.component.scss']
})
export class MainMenuConfigComponent implements OnInit {

  /** The top level form for the InfoMapper Builder app. */
  @Input('appBuilderForm') appBuilderForm: FormGroup;
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the basin name. */
  @Output('updateTitleInput') updateTitleInput = new EventEmitter<any>();


  constructor() { }

  ngOnInit(): void {
  }

}
