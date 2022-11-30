import { Component,
          Input,
          OnInit }      from '@angular/core';

import { faFile,
          faFolder,
          faLeftLong }  from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-file-browser',
  templateUrl: './file-browser.component.html',
  styleUrls: ['./file-browser.component.scss']
})
export class FileBrowserComponent implements OnInit {

  /**
   * 
   */
  @Input('allFiles') allFiles: any;
  /** All used FontAwesome icons in the FileBrowserComponent. */
  faFile = faFile;
  faFolder = faFolder;
  faLeftLong = faLeftLong;

  constructor() { }


  ngOnInit(): void {
  }

  /**
   * 
   * @param item 
   */
  itemClick(item: any): void {
    if (item.__data) {
      console.log('File clicked:', item);
    } else {

    }
  }

  navigateDown(): void {
    
  }

}
