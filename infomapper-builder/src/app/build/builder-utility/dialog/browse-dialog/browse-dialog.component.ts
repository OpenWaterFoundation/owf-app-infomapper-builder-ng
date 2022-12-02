import { Component,
          OnDestroy,
          OnInit }      from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { faLeftLong,
          faXmark }     from '@fortawesome/free-solid-svg-icons';

import { Observable }   from 'rxjs';
import { first }        from 'rxjs/internal/operators/first';

import * as IM          from '@OpenWaterFoundation/common/services';

import { AuthService }  from 'src/app/services/auth.service';
import { FileService }  from 'src/app/services/file.service';

@Component({
  selector: 'app-browse-dialog',
  templateUrl: './browse-dialog.component.html',
  styleUrls: ['./browse-dialog.component.scss']
})
export class BrowseDialogComponent implements OnInit, OnDestroy {

  /** All used FontAwesome icons in the ConfigDialogComponent. */
  faLeftLong = faLeftLong;
  faXmark = faXmark;


  /**
   * 
   * @param authService 
   * @param dialogRef 
   * @param fileService 
   */
  constructor(private authService: AuthService, private dialogRef: MatDialogRef<BrowseDialogComponent>,
  private fileService: FileService) { }

  
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

    this.authService.listAllBucketFiles().pipe(first()).subscribe((allFiles: any) => {
      this.fileService.setAllFiles(this.fileService.processStorageList(allFiles));
      console.log('Processed file object:', this.fileService.processStorageList(allFiles));

    });
  }

  /**
   * 
   */
  navigateUp(): void {
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
    this.fileService.resetFullBucketPath();
  }

  /**
   * 
   */
  openFile(): void {
    console.log('File totally opened.');
  }

  

}
