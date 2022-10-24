import { Component,
          EventEmitter,
          Input,
          OnInit,
          Output }      from '@angular/core';
import { AbstractControl,
          FormGroup, 
          Validators}   from '@angular/forms';

import * as IM          from '@OpenWaterFoundation/common/services';
import { BuildManager } from '../../build-manager';

@Component({
  selector: 'sub-menu-config',
  templateUrl: './sub-menu-config.component.html',
  styleUrls: ['./sub-menu-config.component.scss', '../shared-styles.scss']
})
export class SubMenuConfigComponent implements OnInit {

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
   * Constructor for the SubMenuConfigComponent.
   */
  constructor() { }


  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
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
   * 
   * @param control The FormControl that will be checked for errors.
   * @returns An array with all errors for the control, or an empty array of no errors.
   */
  formErrors(control: AbstractControl): string[] {
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
   * @param event 
   */
  handleActionControlChoice(event: any): void {

    if (event.value === '') {
      this.appBuilderForm.get('subMenuFG.markdownFile').clearValidators();
      this.appBuilderForm.get('subMenuFG.markdownFile').updateValueAndValidity();
      this.appBuilderForm.get('subMenuFG.dashboardFile').clearValidators();
      this.appBuilderForm.get('subMenuFG.dashboardFile').updateValueAndValidity();
      this.appBuilderForm.get('subMenuFG.mapProject').clearValidators();
      this.appBuilderForm.get('subMenuFG.mapProject').updateValueAndValidity();
      this.appBuilderForm.get('subMenuFG.url').clearValidators();
      this.appBuilderForm.get('subMenuFG.url').updateValueAndValidity();
    } else {
      var controlName: string;

      if (event.value === 'contentPage') {
        controlName = 'markdownFile';
      } else if (event.value === 'dashboard') {
        controlName = 'dashboardFile';
      } else if (event.value === 'displayMap') {
        controlName = 'mapProject';
      } else {
        controlName = 'url';
      }
      this.appBuilderForm.get('subMenuFG.' + controlName).addValidators(Validators.required);
      this.appBuilderForm.get('subMenuFG.' + controlName).updateValueAndValidity();
      this.appBuilderForm.get('subMenuFG.' + controlName).markAsTouched();
    }
  }

  /**
   * This SubMenu has previously been saved. Use the data from the App Service's
   * buildJSON object to fill in this SubMenu's form/input fields.
   */
  private populateFromBuilderJSON(): void {

    var builderJSON = this.buildManager.fullBuilderJSON;

    var nodeIndex = this.buildManager.getNodeIndex(this.node);
    var parentIndex = this.buildManager.getNodeParentIndex(this.node);

    this.updateTitleInput.emit(builderJSON.mainMenu[parentIndex].menus[nodeIndex].name);

    this.appBuilderForm.get('subMenuFG.id')
    .setValue(builderJSON.mainMenu[parentIndex].menus[nodeIndex].id);

    this.appBuilderForm.get('subMenuFG.name')
    .setValue(builderJSON.mainMenu[parentIndex].menus[nodeIndex].name);

    this.appBuilderForm.get('subMenuFG.description')
    .setValue(builderJSON.mainMenu[parentIndex].menus[nodeIndex].description);
    // Optional parameters might have been removed from business object by default.
    if (builderJSON.mainMenu[parentIndex].menus[nodeIndex].action) {
      this.appBuilderForm.get('subMenuFG.action')
      .setValue(builderJSON.mainMenu[parentIndex].menus[nodeIndex].action);
    } else {
      this.appBuilderForm.get('subMenuFG.action')
      .setValue('');
    }
    if (builderJSON.mainMenu[parentIndex].menus[nodeIndex].action === 'contentPage') {
      this.appBuilderForm.get('subMenuFG.markdownFile')
      .setValue(builderJSON.mainMenu[parentIndex].menus[nodeIndex].markdownFile);
    } else if (builderJSON.mainMenu[parentIndex].menus[nodeIndex].action === 'dashboard') {
      this.appBuilderForm.get('subMenuFG.dashboardFile')
      .setValue(builderJSON.mainMenu[parentIndex].menus[nodeIndex].dashboardFile);
    } else if (builderJSON.mainMenu[parentIndex].menus[nodeIndex].action === 'displayMap') {
      this.appBuilderForm.get('subMenuFG.mapProject')
      .setValue(builderJSON.mainMenu[parentIndex].menus[nodeIndex].mapProject);
    } else if (builderJSON.mainMenu[parentIndex].menus[nodeIndex].action === 'externalLink') {
      this.appBuilderForm.get('subMenuFG.url')
      .setValue(builderJSON.mainMenu[parentIndex].menus[nodeIndex].url);
    }
    // Optional.
    if (builderJSON.mainMenu[parentIndex].menus[nodeIndex].enabled) {
      this.appBuilderForm.get('subMenuFG.enabled')
      .setValue(builderJSON.mainMenu[parentIndex].menus[nodeIndex].enabled);
    } else {
      this.appBuilderForm.get('subMenuFG.enabled')
      .setValue('');
    }
    // Optional.
    if (builderJSON.mainMenu[parentIndex].menus[nodeIndex].doubleSeparatorBefore) {
      this.appBuilderForm.get('subMenuFG.doubleSeparatorBefore')
      .setValue(builderJSON.mainMenu[parentIndex].menus[nodeIndex].doubleSeparatorBefore);
    } else {
      this.appBuilderForm.get('subMenuFG.doubleSeparatorBefore')
      .setValue('');
    }
    // Optional.
    if (builderJSON.mainMenu[parentIndex].menus[nodeIndex].separatorBefore) {
      this.appBuilderForm.get('subMenuFG.separatorBefore')
      .setValue(builderJSON.mainMenu[parentIndex].menus[nodeIndex].separatorBefore);
    } else {
      this.appBuilderForm.get('subMenuFG.separatorBefore')
      .setValue('');
    }
    // Optional.
    if (builderJSON.mainMenu[parentIndex].menus[nodeIndex].visible) {
      this.appBuilderForm.get('subMenuFG.visible')
      .setValue(builderJSON.mainMenu[parentIndex].menus[nodeIndex].visible);
    } else {
      this.appBuilderForm.get('subMenuFG.visible')
      .setValue('');
    }
  }

  /**
   * Sets all defaults for the SubMenu FormGroup and marks all required fields as
   * touched so they immediately show an error when the dialog is opened.
   */
  private setDefaults(): void {

    var idControl = this.appBuilderForm.get('subMenuFG.id');
    idControl.setValue('');
    idControl.markAsTouched();

    var nameControl = this.appBuilderForm.get('subMenuFG.name');
    nameControl.setValue('');
    nameControl.markAsTouched();

    var descriptionControl = this.appBuilderForm.get('subMenuFG.description');
    descriptionControl.setValue('');
    descriptionControl.markAsTouched();

    this.appBuilderForm.get('subMenuFG.action').setValue('');
    this.appBuilderForm.get('subMenuFG.enabled').setValue('');
    this.appBuilderForm.get('subMenuFG.doubleSeparatorBefore').setValue('');
    this.appBuilderForm.get('subMenuFG.separatorBefore').setValue('');
    this.appBuilderForm.get('subMenuFG.visible').setValue('');
  }

  /**
   * Called after each key press by the user in the name field.
   */
   titleInput(): void {
    this.updateTitleInput.emit(this.appBuilderForm.get('subMenuFG.name').value);
  }

}
