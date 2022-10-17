import { Component,
          EventEmitter,
          Input,
          OnInit,
          Output }      from '@angular/core';
import { AbstractControl,
          FormGroup }   from '@angular/forms';

import { AppService }   from 'src/app/app.service';
import * as IM          from '@OpenWaterFoundation/common/services';
import { BuildManager } from '../../build-manager';


@Component({
  selector: 'main-menu-config',
  templateUrl: './main-menu-config.component.html',
  styleUrls: ['./main-menu-config.component.scss', '../shared-styles.scss']
})
export class MainMenuConfigComponent implements OnInit {

  /** The top level form for the InfoMapper Builder app. */
  @Input('appBuilderForm') appBuilderForm: FormGroup;
  /** Singleton BuildManager instance to uniquely add different nodes to the
   * displayed tree. */
  buildManager: BuildManager = BuildManager.getInstance();
  /** The custom & built-in error messages to be displayed under a form with an error. */
  formErrorMessages = {
    required: 'Required'
  };
  /** The currently edited Tree Node. */
  @Input('node') node: IM.TreeNodeData;
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the basin name. */
  @Output('updateTitleInput') updateTitleInput = new EventEmitter<string>();


  /**
   * 
   * @param appService 
   */
  constructor() { }


  /**
   * 
   * @param control The FormControl that will be checked for errors.
   * @returns An array with each 
   */
  formErrors(control: AbstractControl | string): string[] {

    if (control instanceof AbstractControl) {
      return control.errors ? Object.keys(control.errors) : [];
    } else {

      switch(control) {
        case 'contentPage':
        case 'dashboard':
        case 'displayMap':
        case 'externalLink':
          return ['required'];
      }
    }
    
  }

  /**
   * 
   */
  ngOnInit(): void {
    this.updateTitleInput.emit('');

    if (this.node.saved) {
      this.populateFromBuilderJSON();
    } else {
      this.setDefaults();
    }
  }

  /**
   * This Main Menu node has been saved before, so used the builderJSON business
   * object to populate the fields with its data.
   */
  private populateFromBuilderJSON(): void {

    var builderJSON = this.buildManager.fullBuilderJSON;
    var nodeIndex = +this.buildManager.getNodeIndex(this.node);

    console.log('populateFromBuilderJSON node:', this.node);
    console.log('nodeIndex:', nodeIndex);
    this.updateTitleInput.emit(builderJSON.mainMenu[nodeIndex].name);

    this.appBuilderForm.get('mainMenuFG.id')
    .setValue(builderJSON.mainMenu[nodeIndex].id);

    this.appBuilderForm.get('mainMenuFG.name')
    .setValue(builderJSON.mainMenu[nodeIndex].name);

    this.appBuilderForm.get('mainMenuFG.description')
    .setValue(builderJSON.mainMenu[nodeIndex].description);

    this.appBuilderForm.get('mainMenuFG.action')
    .setValue(builderJSON.mainMenu[nodeIndex].action);

    if (builderJSON.mainMenu[nodeIndex].action === 'contentPage') {
      this.appBuilderForm.get('mainMenuFG.markdownFile')
      .setValue(builderJSON.mainMenu[nodeIndex].markdownFile);
    } else if (builderJSON.mainMenu[nodeIndex].action === 'dashboard') {
      this.appBuilderForm.get('mainMenuFG.dashboardFile')
      .setValue(builderJSON.mainMenu[nodeIndex].dashboardFile);
    } else if (builderJSON.mainMenu[nodeIndex].action === 'displayMap') {
      this.appBuilderForm.get('mainMenuFG.mapProject')
      .setValue(builderJSON.mainMenu[nodeIndex].mapProject);
    } else if (builderJSON.mainMenu[nodeIndex].action === 'externalLink') {
      this.appBuilderForm.get('mainMenuFG.url')
      .setValue(builderJSON.mainMenu[nodeIndex].url);
    }

    this.appBuilderForm.get('mainMenuFG.enabled')
    .setValue(builderJSON.mainMenu[nodeIndex].enabled);

    this.appBuilderForm.get('mainMenuFG.visible')
    .setValue(builderJSON.mainMenu[nodeIndex].visible);
  }

  /**
   * All defaults are set because this Main Menu could have been used previously
   * by another node.
   */
  private setDefaults(): void {

    var idControl = this.appBuilderForm.get('mainMenuFG.id')
    idControl.setValue('');
    idControl.markAsTouched();

    var nameControl = this.appBuilderForm.get('mainMenuFG.name')
    nameControl.setValue('');
    nameControl.markAsTouched();

    var descriptionControl = this.appBuilderForm.get('mainMenuFG.description')
    descriptionControl.setValue('');
    descriptionControl.markAsTouched();

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
