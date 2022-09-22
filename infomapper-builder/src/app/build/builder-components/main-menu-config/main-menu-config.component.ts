import { Component,
          EventEmitter,
          Input,
          OnInit,
          Output }    from '@angular/core';
import { FormGroup }  from '@angular/forms';

import { AppService } from 'src/app/app.service';
import * as IM        from '@OpenWaterFoundation/common/services';


@Component({
  selector: 'main-menu-config',
  templateUrl: './main-menu-config.component.html',
  styleUrls: ['./main-menu-config.component.scss']
})
export class MainMenuConfigComponent implements OnInit {

  /** The top level form for the InfoMapper Builder app. */
  @Input('appBuilderForm') appBuilderForm: FormGroup;
  /** The currently edited Tree Node. */
  @Input('node') node: IM.TreeNodeData;
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the basin name. */
  @Output('updateTitleInput') updateTitleInput = new EventEmitter<string>();


  constructor(private appService: AppService) { }


  ngOnInit(): void {
    this.updateTitleInput.emit('');

    if (this.appService.hasNodeBeenSaved('Main Menu ' + this.node.index)) {
      this.populateFromBuilderJSON();
    } else {
      this.setDefaults();
    }
  }

  /**
   * 
   */
  private populateFromBuilderJSON(): void {

    var fullBuilderJSON = this.appService.fullBuilderJSON;
    console.log('All Main Menus:', fullBuilderJSON.mainMenu);
    console.log('This Main Menu:', fullBuilderJSON.mainMenu[this.node.index]);
    this.updateTitleInput.emit(fullBuilderJSON.mainMenu[this.node.index].name);

    this.appBuilderForm.get('mainMenuFG.name')
    .setValue(fullBuilderJSON.mainMenu[this.node.index].name);

    this.appBuilderForm.get('mainMenuFG.id')
    .setValue(fullBuilderJSON.mainMenu[this.node.index].id);

    this.appBuilderForm.get('mainMenuFG.action')
    .setValue(fullBuilderJSON.mainMenu[this.node.index].action);

    if (fullBuilderJSON.mainMenu[this.node.index].action === 'contentPage') {
      this.appBuilderForm.get('mainMenuFG.markdownFile')
      .setValue(fullBuilderJSON.mainMenu[this.node.index].markdownFile);
    } else if (fullBuilderJSON.mainMenu[this.node.index].action === 'dashboard') {
      this.appBuilderForm.get('mainMenuFG.dashboardFile')
      .setValue(fullBuilderJSON.mainMenu[this.node.index].dashboardFile);
    } else if (fullBuilderJSON.mainMenu[this.node.index].action === 'displayMap') {
      this.appBuilderForm.get('mainMenuFG.mapProject')
      .setValue(fullBuilderJSON.mainMenu[this.node.index].mapProject);
    } else if (fullBuilderJSON.mainMenu[this.node.index].action === 'externalLink') {
      this.appBuilderForm.get('mainMenuFG.url')
      .setValue(fullBuilderJSON.mainMenu[this.node.index].url);
    }

    this.appBuilderForm.get('mainMenuFG.enabled')
    .setValue(fullBuilderJSON.mainMenu[this.node.index].enabled);

    this.appBuilderForm.get('mainMenuFG.visible')
    .setValue(fullBuilderJSON.mainMenu[this.node.index].visible);
  }

  /**
   * 
   */
  private setDefaults(): void {

    this.appBuilderForm.get('mainMenuFG.name').setValue('');
    this.appBuilderForm.get('mainMenuFG.id').setValue('');
    this.appBuilderForm.get('mainMenuFG.action').setValue('');
    this.appBuilderForm.get('mainMenuFG.enabled').setValue('True');
    this.appBuilderForm.get('mainMenuFG.visible').setValue('True');
  }

  /**
   * Called after each key press by the user in the name field.
   */
   titleInput(): void {
    this.updateTitleInput.emit(this.appBuilderForm.get('mainMenuFG.name').value);
  }

}
