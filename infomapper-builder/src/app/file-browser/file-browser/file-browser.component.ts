import { Component,
          OnInit }     from '@angular/core';

import { faFile,
          faFolder,
          faLeftLong } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
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


  ngOnInit(): void {
  }

  /**
   * 
   * @param item 
   */
  itemClick(item: any): void {
    if (Object.keys(item.value.__data.value).length > 1) {
      console.log('Folder clicked:', item);
      this.navigateDown(item);
    } else {
      console.log('File clicked:', item);
      this.selectFile();
    }
  }

  navigateDown(item: any): void {
    this.fileService.appendBucketPath(item.key);

    // this.fileService.updateCurrentLevelItems();
    this.fileService.updateCurrentLevelItems(item.value);
  }

  selectFile(): void {

  }

}
