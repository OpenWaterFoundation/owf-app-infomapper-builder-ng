import { Component,
          OnInit }             from '@angular/core';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss', '../../../shared-styles.scss']
})
export class GeneralTabComponent implements OnInit {

  /** Array of all account properties to be shown under the Account Information section. */
  readonly accountProperties = [
    { name: 'Name', value: this.storageService.getUserParamAccount().values.name },
    { name: 'Type', value: this.storageService.getUserParamAccount().values.accountType },
    { name: 'Path', value: this.storageService.getUserParamAccount().values.accountPath },
    { name: 'UserPoolId', value: this.storageService.getUserParamAccount().values.userPoolId }
  ];


  /**
   * The constructor for the GeneralTabComponent.
   * @param storageService Service for utilizing the universally-supported (except Opera Mini)
   * `localStorage` object in the global `window` object.
   */
  constructor(private storageService: LocalStorageService) {

  }


  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
   */
  ngOnInit(): void {

  }

}
