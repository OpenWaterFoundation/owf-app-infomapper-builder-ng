import { Component,
          EventEmitter,
          OnInit, 
          Output }     from '@angular/core';
import { faFile}       from '@fortawesome/free-regular-svg-icons';
import { faFolder,
          faLeftLong } from '@fortawesome/free-solid-svg-icons';
import { first,
          Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { FileService } from 'src/app/services/file.service';


@Component({
  selector: 'app-file-browser',
  templateUrl: './file-browser.component.html',
  styleUrls: ['./file-browser.component.scss']
})
export class FileBrowserComponent implements OnInit {

  /** All used FontAwesome icons in the FileBrowserComponent. */
  faFile = faFile;
  faFolder = faFolder;
  faLeftLong = faLeftLong;
  /** EventEmitter that alerts the BrowseDialogComponent (parent) that an update
   * has occurred, and sends the source path. */
  @Output('fileSourcePath') fileSourcePath = new EventEmitter<string>();
  /**
   * Determines what the currently selected file is.
   */
  selectedItem: string;
  

  /**
   * 
   * @param fileService 
   */
  constructor(private fileService: FileService, private authService: AuthService) {

  }


  get currentLevelItems(): Observable<{}> {
    return this.fileService.currentLevelItems;
  }

  get isLoading(): Observable<boolean> {
    return this.fileService.isLoading;
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
   */
  ngOnInit(): void {
  }

  /**
   * 
   * @param item 
   */
  itemClick(item: any): void {
    if (Object.keys(item.value).length > 1) {
      // this.fileSelected = '';
      this.fileService.navigateDown(item);
    } else {
      this.selectFile(item);
    }
  }

  /**
   * @param file 
   */
  selectFile(file: any): void {
    this.selectedItem = file.value.__data.key.split('/').pop();

    this.authService.getBucketFile(file.value.__data.key).pipe(first())
    .subscribe((sourcePathToFile: string) => {
      this.fileSourcePath.emit(sourcePathToFile)
    });
  }

}
