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

  /**
   * 
   */
  clickTimer: any;
  /** All used FontAwesome icons in the FileBrowserComponent. */
  faFile = faFile;
  faFolder = faFolder;
  faLeftLong = faLeftLong;
  /** EventEmitter that alerts the BrowseDialogComponent (parent) that an update
   * has occurred, and sends the source path. */
  @Output('fileSourcePath') fileSourcePath = new EventEmitter<{sourcePath: string, isDblClick: boolean}>();
  

  /**
   * 
   * @param fileService 
   */
  constructor(private fileService: FileService, private authService: AuthService) {

  }


  /**
   * 
   */
  get currentLevelItems(): Observable<{}> {
    return this.fileService.currentLevelItems;
  }

  /**
   * 
   */
  get isLoading(): Observable<boolean> {
    return this.fileService.isLoading;
  }

  /**
   * 
   */
  get selectedFile(): string {
    return this.fileService.selectedFile;
  }

  /**
   * 
   * @param item 
   * @returns 
   */
  itemIsFile(item: any): boolean {
    return Object.keys(item.value).length === 1 ? true : false;
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
   */
  ngOnInit(): void {
  }

  /**
   * Not currently used.
   * @param item 
   */
  itemClick(item: any): void {
    this.clickTimer = setTimeout(() => { this.itemSingleClick(item); }, 250);
  }

  /**
   * Not currently used.
   * @param item 
   */
  itemDoubleClick(item: any): void {
    clearTimeout(this.clickTimer);
    this.clickTimer = undefined;

    if (this.itemIsFile(item)) {
      this.selectFile(item, true);
    }
  }

  /**
   * 
   * @param item 
   */
  private itemSingleClick(item: any) {
    if (!this.itemIsFile(item)) {
      this.fileService.selectedFile = '';
      this.fileService.navigateDown(item);
    } else {
      this.selectFile(item, false);
    }
  }

  /**
   * @param file 
   */
  selectFile(file: any, isDblClick: boolean): void {
    this.fileService.selectedFile = file.value.__data.key.split('/').pop();

    this.authService.getBucketFile(file.value.__data.key).pipe(first())
    .subscribe((sourcePathToFile: string) => {
      this.fileSourcePath.emit({ sourcePath: sourcePathToFile, isDblClick: isDblClick })
    });
  }

}
