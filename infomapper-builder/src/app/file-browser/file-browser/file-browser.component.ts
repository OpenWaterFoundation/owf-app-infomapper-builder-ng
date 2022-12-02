import { Component,
          OnInit }     from '@angular/core';
import { faFile}       from '@fortawesome/free-regular-svg-icons';
import { faFolder,
          faLeftLong } from '@fortawesome/free-solid-svg-icons';
import { Observable }  from 'rxjs';
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
  

  /**
   * 
   * @param fileService 
   */
  constructor(private fileService: FileService) { }


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
      // this.fileSelected = false;
      this.fileService.navigateDown(item);
    } else {
      this.selectFile(item);
    }
  }

  selectFile(file: any): void {
    console.log('File selected:', file);
  }


  // TODO: Add mat progress spinner.
}
