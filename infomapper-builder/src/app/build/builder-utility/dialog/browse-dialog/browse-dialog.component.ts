import { Component,
          Inject,
          OnDestroy,
          OnInit }          from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { faLeftLong,
          faXmark }         from '@fortawesome/free-solid-svg-icons';

import { Observable }       from 'rxjs';
import { first }            from 'rxjs/internal/operators/first';

import { AuthService }      from 'src/app/services/auth.service';
import { FileService }      from 'src/app/services/file.service';

@Component({
  selector: 'app-browse-dialog',
  templateUrl: './browse-dialog.component.html',
  styleUrls: ['./browse-dialog.component.scss']
})
export class BrowseDialogComponent implements OnInit, OnDestroy {

  /**
   * 
   */
  dialogData: any;
  /** All used FontAwesome icons in the ConfigDialogComponent. */
  faLeftLong = faLeftLong;
  faXmark = faXmark;
  /**
   * 
   */
  private selectedFileResults: any;


  /**
   * 
   * @param authService 
   * @param dialogRef 
   * @param fileService 
   */
  constructor(private authService: AuthService, private dialogRef: MatDialogRef<BrowseDialogComponent>,
  private fileService: FileService, @Inject(MAT_DIALOG_DATA) dialogData: any) {

    this.dialogData = dialogData;
  }

  
  /**
   * 
   */
  get bucketName(): string {
    return this.authService.amplify.Storage.AWSS3.bucket;
  }

  /**
   * 
   */
  get bucketPath$(): Observable<string> {
    return this.fileService.bucketPath;
  }

  /**
   * 
   */
  get canNavigateUp$(): Observable<string> {
    return this.fileService.bucketPath;
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked, and removes this
   * dialog's window ID from the windowManager.
   */
  closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * 
   */
  private fetchS3BucketFiles(): void {

    if (!this.fileService.isLoading) {
      this.fileService.setToLoading(true);
    }

    this.authService.listAllBucketFiles().pipe(first()).subscribe(({hasNextToken, nextToken, results}) => {
      console.log('Has next token:', hasNextToken);
      console.log('Next token:', nextToken);
      console.log('Results:', results);
      // this.fileService.setAllFiles(this.fileService.processStorageList(allFiles));
    });
  }

  /**
   * 
   */
  isOpenDisabled(): boolean {
    return this.fileService.selectedFile ? false : true;
  }

  /**
   * 
   */
  navigateUp(): void {
    this.fileService.selectedFile = '';
    this.fileService.navigateUp();
  }

  /**
   * 
   */
  ngOnInit(): void {

    if (!this.fileService.allOriginalFiles) {
      this.fetchS3BucketFiles();
    } else {
      this.fileService.setAllFiles(this.fileService.allOriginalFiles);
    }
    
  }
  
  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    this.fileService.selectedFile = '';
    this.fileService.resetFullBucketPath();
  }

  /**
   * Called when the Open button is clicked. Can only be clicked when a file has
   * been selected.
   */
  openFileAndCloseDialog(): void {
    this.dialogRef.close(this.selectedFileResults ? this.selectedFileResults : undefined);
  }

  /**
   * Invoked when a file is selected. An Event Emitter is sent from the FileBrowser
   * component as @Output.
   * @param $event The event object passed from the File Browser. The `results` property
   * will be set with the appropriate data.
   */
  getSelectedFileResults($event: any): void {
    this.selectedFileResults = $event.results;

    // if ($event.isDblClick) {
    //   this.openFileAndCloseDialog();
    // }
  }

}
