import { Component,
          Inject,
          OnInit }          from '@angular/core';
import { FormGroup }        from '@angular/forms';
import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { faXmark }          from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  /**
   * 
   */
  appBuilderForm: FormGroup;
  /** All used FontAwesome icons in the DialogComponent. */
  faXmark = faXmark;
  /** The string to be dynamically displayed on this component's top header. */
  headerText = '';

  nodeName: string;


  constructor(@Inject(MAT_DIALOG_DATA) private dialogData: any,
  private dialogRef: MatDialogRef<DialogComponent>) {

    this.appBuilderForm = this.dialogData.appBuilderForm;
    this.nodeName = this.dialogData.nodeName;
  }


  /**
   * Closes the Mat Dialog popup when the Close button is clicked, and removes this
   * dialog's window ID from the windowManager.
   */
   closeDialog(): void {
    this.dialogRef.close();
  }
  
  /**
   * A lifecycle hook that is called after Angular has initialized all data-bound
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
   * Actions to perform when the Save button is clicked.
   */
  saveData(): void {
    this.dialogRef.close(this.appBuilderForm);
  }

  /**
   * Updates the value of this Dialog component's draggable header field.
   * @param titleInput The value of a form's Title (or name?) form control.
   */
  updateHeaderText(titleInput: string): void {
    this.headerText = titleInput;
  }

}
