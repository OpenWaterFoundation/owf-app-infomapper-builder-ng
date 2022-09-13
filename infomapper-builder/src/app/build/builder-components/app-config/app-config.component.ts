import { Component,
          Input,
          OnInit }                 from '@angular/core';
import { FormGroup }               from '@angular/forms';





@Component({
  selector: 'app-config',
  templateUrl: './app-config.component.html',
  styleUrls: ['./app-config.component.scss']
})
export class AppConfigComponent implements OnInit {

  /**
   * 
   */
  @Input('appBuilderForm') appBuilderFormGroup: FormGroup;


  constructor() { }


  ngOnInit(): void {
  }

}
