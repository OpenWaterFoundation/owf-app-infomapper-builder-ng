import { Component,
          Input,
          Output,
          OnInit, 
          EventEmitter }  from '@angular/core';
import { AbstractControl,
          FormGroup }     from '@angular/forms';

import * as IM            from '@OpenWaterFoundation/common/services';

import { BuildManager }   from '../../build-manager';


@Component({
  selector: 'datastore-config',
  templateUrl: './datastore-config.component.html',
  styleUrls: ['./datastore-config.component.scss', '../../../shared-styles.scss']
})
export class DatastoreConfigComponent implements OnInit {

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
   * Constructor for the DatastoreConfigComponent.
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
   * @param control The FormControl that will be checked for errors.
   * @returns An array with all errors for the control, or an empty array of no errors.
   */
  formErrors(control: AbstractControl): string[] {
    return control.errors ? Object.keys(control.errors) : [];
  }

  /**
   * This Datastore node has been saved before, so used the builderJSON business
   * object to populate the fields with its previous data.
   */
   private populateFromBuilderJSON(): void {

    var builderJSON = this.buildManager.fullBuilderJSON;
    var nodeIndex = this.buildManager.getNodeIndex(this.node);

    this.updateTitleInput.emit(builderJSON.datastores[nodeIndex].name);

    this.appBuilderForm.get('datastoreFG.name')
    .setValue(builderJSON.datastores[nodeIndex].name);

    this.appBuilderForm.get('datastoreFG.type')
    .setValue(builderJSON.datastores[nodeIndex].type);

    this.appBuilderForm.get('datastoreFG.rootUrl')
    .setValue(builderJSON.datastores[nodeIndex].rootUrl);

    // this.appBuilderForm.get('datastoreFG.aliases')
    // .setValue(builderJSON.datastores[nodeIndex].aliases);

    this.appBuilderForm.get('datastoreFG.apiKey')
    .setValue(builderJSON.datastores[nodeIndex].apiKey);
  }

  /**
   * All defaults are set because this Datastore could have been used previously
   * by another node.
   */
   private setDefaults(): void {

    var nameControl = this.appBuilderForm.get('datastoreFG.name')
    nameControl.setValue('');
    nameControl.markAsTouched();

    var typeControl = this.appBuilderForm.get('datastoreFG.type')
    typeControl.setValue('');
    typeControl.markAsTouched();

    var rootUrlControl = this.appBuilderForm.get('datastoreFG.rootUrl')
    rootUrlControl.setValue('');
    rootUrlControl.markAsTouched();

    // this.appBuilderForm.get('datastoreFG.aliases').setValue('');
    this.appBuilderForm.get('datastoreFG.apiKey').setValue('');
  }

  /**
   * Called after each key press by the user in the name field.
   */
   titleInput(): void {
    this.updateTitleInput.emit(this.appBuilderForm.get('datastoreFG.name').value);
  }
}
