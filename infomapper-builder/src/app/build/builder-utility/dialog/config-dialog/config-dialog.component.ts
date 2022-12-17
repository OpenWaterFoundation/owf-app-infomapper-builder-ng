import { Component,
          Inject,
          OnInit }          from '@angular/core';
import { FormGroup }        from '@angular/forms';
import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { faXmark }          from '@fortawesome/free-solid-svg-icons';

import * as IM              from '@OpenWaterFoundation/common/services';

@Component({
  selector: 'app-config-dialog',
  templateUrl: './config-dialog.component.html',
  styleUrls: ['./config-dialog.component.scss']
})
export class ConfigDialogComponent implements OnInit {

  /** The main FormGroup for the entire application. */
  appBuilderForm: FormGroup;
  /** All used FontAwesome icons in the ConfigDialogComponent. */
  faXmark = faXmark;
  /** The string to be dynamically displayed on this component's top header. */
  headerText = '';
  /** The currently edited Tree Node. */
  node: IM.TreeFlatNode;


  /**
   * The constructor for the ConfigDialogComponent.
   * @param dialogData 
   * @param dialogRef 
   */
  constructor(@Inject(MAT_DIALOG_DATA) private dialogData: any,
  private dialogRef: MatDialogRef<ConfigDialogComponent>) {

    this.appBuilderForm = this.dialogData.appBuilderForm;
    this.node = this.dialogData.node;
  }


  /**
   * Closes the Mat Dialog popup when the Close button is clicked, and removes this
   * dialog's window ID from the windowManager.
   */
   closeDialog(): void {
    this.dialogRef.close();
  }
  
  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
   */
  ngOnInit(): void {
    this.dialogSetup();
  }

  /**
   * Initializes all necessary dialog setup steps.
   */
  dialogSetup(): void {
    if (this.appBuilderForm.get('appConfigFG.title').value !== '') {
      this.updateHeaderText(this.appBuilderForm.get('appConfigFG.title').value);
    }
  }
  
  /**
   * 
   * @param formGroup 
   * @returns 
   */
  findInvalidControls(formGroup: string) {
    var invalid = [];
    const group = this.appBuilderForm.get(formGroup) as FormGroup;
    for (const name in group.controls) {
        if (group.controls[name].invalid) {
            invalid.push(name);
        }
    }
    return invalid;
  }

  /**
   * Determines whether the config form is invalid and enables the Save button based
   * on the result.
   * @returns 
   */
  isSaveDisabled(): boolean {

    var formGroup: string;

    if (this.node.level === 'Application') {
      formGroup = 'appConfigFG';
    } else if (this.node.level === 'Datastore') {
      formGroup = 'datastoreFG';
    } else if (this.node.level === 'Main Menu') {
      formGroup = 'mainMenuFG';
    } else {
      formGroup = 'subMenuFG';
    }
    return this.appBuilderForm.get(formGroup).invalid;
  }

  /**
   * When the Save button is clicked, close the dialog with the form result.
   */
  saveData(node: IM.TreeFlatNode): void {
    this.dialogRef.close(node);
  }

  /**
   * Updates the value of this Dialog component's draggable header field.
   * @param titleInput The value of a form's Title (or name?) form control.
   */
  updateHeaderText(titleInput: string): void {
    this.headerText = titleInput;
  }

}
