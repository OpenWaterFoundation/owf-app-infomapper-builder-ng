import { Component,
          EventEmitter,
          Input,
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

  @Input('dialogData') dialogData: any;
  /** All used FontAwesome icons in the FileBrowserComponent. */
  faFile = faFile;
  faFolder = faFolder;
  faLeftLong = faLeftLong;
  /** EventEmitter that alerts the BrowseDialogComponent (parent) that an update
   * has occurred, and sends the source path. */
  @Output('browseResults') browseResults = new EventEmitter<{results: any, resultType?: string}>();
  

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
   * @param file 
   */
  private emitFileContents(file: any): void {

    this.authService.getFileSourcePath(file.value.__data.key).pipe(first())
    .subscribe((sourcePathToFile: string) => {

      // How to check what the file contents are?
      this.browseResults.emit({ results: sourcePathToFile });
    });
  }

  /**
   * Uses the AuthService to fetch the AWS URL to the provided file, and prettifies
   * it for readability.
   * @param file 
   */
  private emitFileSourcePath(file: any): void {

    this.authService.getFileSourcePath(file.value.__data.key).pipe(first())
    .subscribe((sourcePathToFile: string) => {

      var prettifiedSourcePath = sourcePathToFile.split('?')[0].split('/').slice(3).join('/');
      // The first split will remove everything past the '?' query parameter.
      // The second split & slice will remove the first 3 sections between the forward
      // slashes. At the end, the remaining fragments will be rejoined with more
      // forward slashes. The original source path will look like the following:
      // https://s3.<aws-region>.amazonaws.com/<aws-bucket-name>/<filename>?<query-params>
      this.browseResults.emit({ results: prettifiedSourcePath });
    });
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
   * Determines whether the clicked item is a file or folder.
   * @param item The clicked item object from the browser.
   */
   itemSingleClick(item: any) {
    if (!this.itemIsFile(item)) {
      this.fileService.selectedFile = '';
      this.fileService.navigateDown(item);
    } else {
      this.selectFile(item);
    }
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
   */
  ngOnInit(): void {

  }

  // /**
  //  * Not currently used.
  //  * @param item 
  //  */
  // itemClick(item: any): void {
  //   this.clickTimer = setTimeout(() => { this.itemSingleClick(item); }, 250);
  // }

  // /**
  //  * Not currently used.
  //  * @param item 
  //  */
  // itemDoubleClick(item: any): void {
  //   clearTimeout(this.clickTimer);
  //   this.clickTimer = undefined;

  //   if (this.itemIsFile(item)) {
  //     this.selectFile(item, true);
  //   }
  // }

  /**
   * Determines what to do with the currently selected file once opened.
   * @param file 
   */
  selectFile(file: any): void {
    this.fileService.selectedFile = file.value.__data.key.split('/').pop();

    switch(this.dialogData.type) {
      case 'content':
        this.emitFileContents(file);
        break;
      case 'sourcePath':
        this.emitFileSourcePath(file);
        break;
    }

  }

}
