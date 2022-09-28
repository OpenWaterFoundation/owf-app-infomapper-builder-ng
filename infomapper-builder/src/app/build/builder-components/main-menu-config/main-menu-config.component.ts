import { Component,
          EventEmitter,
          Input,
          OnInit,
          Output }     from '@angular/core';
import { AbstractControl,
          FormGroup }  from '@angular/forms';

import { AppService }  from 'src/app/app.service';
import * as IM         from '@OpenWaterFoundation/common/services';


@Component({
  selector: 'main-menu-config',
  templateUrl: './main-menu-config.component.html',
  styleUrls: ['./main-menu-config.component.scss', '../shared-styles.scss']
})
export class MainMenuConfigComponent implements OnInit {

  /** The top level form for the InfoMapper Builder app. */
  @Input('appBuilderForm') appBuilderForm: FormGroup;
  /** The custom & built-in error messages to be displayed under a form with an error. */
  formErrorMessages = {
    required: 'Required'
  }
  /** The currently edited Tree Node. */
  @Input('node') node: IM.TreeNodeData;
  /** EventEmitter that alerts the Map component (parent) that an update has happened,
   * and sends the basin name. */
  @Output('updateTitleInput') updateTitleInput = new EventEmitter<string>();


  /**
   * 
   * @param appService 
   */
  constructor(private appService: AppService) { }


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

  ngOnInit(): void {
    this.updateTitleInput.emit('');

    if (this.appService.hasNodeBeenSaved('Main Menu ' + this.node.index)) {
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

    var builderJSON = this.appService.fullBuilderJSON;

    this.updateTitleInput.emit(builderJSON.mainMenu[this.node.index].name);

    this.appBuilderForm.get('mainMenuFG.id')
    .setValue(builderJSON.mainMenu[this.node.index].id);

    this.appBuilderForm.get('mainMenuFG.name')
    .setValue(builderJSON.mainMenu[this.node.index].name);

    this.appBuilderForm.get('mainMenuFG.action')
    .setValue(builderJSON.mainMenu[this.node.index].action);

    if (builderJSON.mainMenu[this.node.index].action === 'contentPage') {
      this.appBuilderForm.get('mainMenuFG.markdownFile')
      .setValue(builderJSON.mainMenu[this.node.index].markdownFile);
    } else if (builderJSON.mainMenu[this.node.index].action === 'dashboard') {
      this.appBuilderForm.get('mainMenuFG.dashboardFile')
      .setValue(builderJSON.mainMenu[this.node.index].dashboardFile);
    } else if (builderJSON.mainMenu[this.node.index].action === 'displayMap') {
      this.appBuilderForm.get('mainMenuFG.mapProject')
      .setValue(builderJSON.mainMenu[this.node.index].mapProject);
    } else if (builderJSON.mainMenu[this.node.index].action === 'externalLink') {
      this.appBuilderForm.get('mainMenuFG.url')
      .setValue(builderJSON.mainMenu[this.node.index].url);
    }

    this.appBuilderForm.get('mainMenuFG.enabled')
    .setValue(builderJSON.mainMenu[this.node.index].enabled);

    this.appBuilderForm.get('mainMenuFG.visible')
    .setValue(builderJSON.mainMenu[this.node.index].visible);
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
