import { Component,
          OnInit }                 from '@angular/core';
import { FormControl,
          FormGroup,
          Validators }             from '@angular/forms';

import { ActivatedRoute,
          ParamMap,
          Router }                 from '@angular/router';
import { Subject,
          takeUntil }              from 'rxjs';
import { AppService }              from '../app.service';


@Component({
  selector: 'app-build',
  templateUrl: './build.component.html',
  styleUrls: ['./build.component.scss']
})
export class BuildComponent implements OnInit {

  appBuilderForm = new FormGroup({
    title: new FormControl('', Validators.required),
    homePage: new FormControl({ value: '/content-page/home.md', disabled: true }),
    favicon: new FormControl(''),
    version: new FormControl(''),
    mainMenu: new FormGroup({
      name: new FormControl('', Validators.required),
      action: new FormControl('', Validators.required),
      id: new FormControl('', Validators.required),
      tooltip: new FormControl('')
    })
  });
  /** Subject that is completed when this component is destroyed. */
  destroyed = new Subject<void>();
  /** Boolean set to false if the URL id for this Build component does not exist
   * in any `app-config.json` mainMenu or subMenu id. */
  validBuildID = true;


  constructor(private router: Router, private actRoute: ActivatedRoute,
  private appService: AppService) { }

  ngOnInit(): void {
    // When the parameters in the URL are changed the map will refresh and load
    // according to new configuration data.
    this.actRoute.paramMap.pipe(takeUntil(this.destroyed)).subscribe((paramMap: ParamMap) => {

      var buildID = paramMap.get('builderId');
      this.validBuildID = this.appService.validURLConfigID(buildID);

      if (this.validBuildID === false) {
        return;
      }


    });
  }



}
