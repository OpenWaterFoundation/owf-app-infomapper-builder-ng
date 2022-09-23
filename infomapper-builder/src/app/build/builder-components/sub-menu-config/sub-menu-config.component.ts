import { Component,
          EventEmitter,
          Input,
          OnInit,
          Output }    from '@angular/core';
import { FormGroup }  from '@angular/forms';

import * as IM        from '@OpenWaterFoundation/common/services';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'sub-menu-config',
  templateUrl: './sub-menu-config.component.html',
  styleUrls: ['./sub-menu-config.component.scss', '../shared-styles.scss']
})
export class SubMenuConfigComponent implements OnInit {

  /** The top level form for the InfoMapper Builder app. */
  @Input('appBuilderForm') appBuilderForm: FormGroup;
  /** The currently edited Tree Node. */
  @Input('node') node: IM.TreeNodeData;
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the basin name. */
  @Output('updateTitleInput') updateTitleInput = new EventEmitter<string>();


  constructor(private appService: AppService) { }


  ngOnInit(): void {
    console.log('node saved:', this.appService.hasNodeBeenSaved('SubMenu ' +
    this.node.parentIndex + ',' + this.node.index));
    this.updateTitleInput.emit('');

    if (this.appService.hasNodeBeenSaved('SubMenu ' + this.node.parentIndex + ',' + this.node.index)) {
      this.populateFromBuilderJSON();
    } else {
      this.setDefaults();
    }
  }

  /**
   * 
   */
  private populateFromBuilderJSON(): void {

    var builderJSON = this.appService.fullBuilderJSON;

    this.updateTitleInput.emit(builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].name);

    this.appBuilderForm.get('subMenuFG.name')
    .setValue(builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].name);

    this.appBuilderForm.get('subMenuFG.description')
    .setValue(builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].description);

    this.appBuilderForm.get('subMenuFG.action')
    .setValue(builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].action);

    if (builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].action === 'contentPage') {
      this.appBuilderForm.get('subMenuFG.markdownFile')
      .setValue(builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].markdownFile);
    } else if (builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].action === 'dashboard') {
      this.appBuilderForm.get('subMenuFG.dashboardFile')
      .setValue(builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].dashboardFile);
    } else if (builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].action === 'displayMap') {
      this.appBuilderForm.get('subMenuFG.mapProject')
      .setValue(builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].mapProject);
    } else if (builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].action === 'externalLink') {
      this.appBuilderForm.get('subMenuFG.url')
      .setValue(builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].url);
    }

    this.appBuilderForm.get('subMenuFG.enabled')
    .setValue(builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].enabled);

    this.appBuilderForm.get('subMenuFG.doubleSeparatorBefore')
    .setValue(builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].doubleSeparatorBefore);

    this.appBuilderForm.get('subMenuFG.separatorBefore')
    .setValue(builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].separatorBefore);

    this.appBuilderForm.get('subMenuFG.visible')
    .setValue(builderJSON.mainMenu[this.node.parentIndex].menus[this.node.index].visible);
  }

  /**
   * 
   */
  private setDefaults(): void {

    var nameControl = this.appBuilderForm.get('subMenuFG.name')
    nameControl.setValue('');
    nameControl.markAsTouched();

    var descriptionControl = this.appBuilderForm.get('subMenuFG.description')
    descriptionControl.setValue('');
    descriptionControl.markAsTouched();

    this.appBuilderForm.get('subMenuFG.action').setValue('');
    this.appBuilderForm.get('subMenuFG.enabled').setValue('True');
    this.appBuilderForm.get('subMenuFG.doubleSeparatorBefore').setValue('False');
    this.appBuilderForm.get('subMenuFG.separatorBefore').setValue('False');
    this.appBuilderForm.get('subMenuFG.visible').setValue('True');
  }

  /**
   * Called after each key press by the user in the name field.
   */
   titleInput(): void {
    this.updateTitleInput.emit(this.appBuilderForm.get('subMenuFG.name').value);
  }

}
