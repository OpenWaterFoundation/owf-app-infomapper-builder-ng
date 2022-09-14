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
  /**
   * 
   */
  windowID: string;


  constructor(@Inject(MAT_DIALOG_DATA) private dialogData: any,
  private dialogRef: MatDialogRef<DialogComponent>) {

    this.appBuilderForm = this.dialogData.appBuilderForm;
    this.windowID = this.dialogData.windowID;
  }

  
  ngOnInit(): void {
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked, and removes this
   * dialog's window ID from the windowManager.
   */
  closeDialog(): void {
    this.dialogRef.close();
    // this.windowManager.removeWindow(this.windowID);
  }

  /**
   * 
   */
  saveData(): void {
    console.log('Saving data here.');
    this.dialogRef.close();
  }

}
