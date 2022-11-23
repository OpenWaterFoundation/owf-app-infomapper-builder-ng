import { Component,
          OnInit }      from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { faXmark }      from '@fortawesome/free-solid-svg-icons';
import { first }        from 'rxjs/internal/operators/first';
import { AuthService }  from 'src/app/services/auth.service';

@Component({
  selector: 'app-browse-dialog',
  templateUrl: './browse-dialog.component.html',
  styleUrls: ['./browse-dialog.component.scss']
})
export class BrowseDialogComponent implements OnInit {

  /**
   * 
   */
  allFiles: any;
  /** All used FontAwesome icons in the ConfigDialogComponent. */
  faXmark = faXmark;


  constructor(private dialogRef: MatDialogRef<BrowseDialogComponent>,
  private authService: AuthService) { }


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
    this.authService.listAllBucketFiles().pipe(first()).subscribe((allFiles: any) => {
      this.allFiles = allFiles;
      console.log('Processed file object:', this.processStorageList(allFiles));
    });
  }

  /**
   * 
   * @param key 
   * @returns 
   */
  private isFolder(key: string): boolean {
    return key.includes('/') ? true : false;
  }

  /**
   * 
   */
  ngOnInit(): void {
    this.fetchS3BucketFiles();
  }

  /**
   * 
   */
  openFile(): void {
    console.log('File totally opened.');
  }

  /**
   * 
   * @param allFiles 
   * @returns 
   */
  processStorageList(allFiles: any) {

    const filesystem = {};
    // https://stackoverflow.com/questions/44759750/how-can-i-create-a-nested-object-representation-of-a-folder-structure
    const add = (source: string, target: any, item: any) => {
      const elements = source.split('/');
      const element = elements.shift();
      if (!element) return; // blank
      target[element] = target[element] || { __data: item }; // element;
      if (elements.length) {
        target[element] = typeof target[element] === 'object' ? target[element] : {};
        add(elements.join('/'), target[element], item);
      }
    };
    allFiles.forEach((item: any) => add(item.key, filesystem, item));
    return filesystem;
  }

}
