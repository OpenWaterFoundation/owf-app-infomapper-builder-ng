import { Component,
          Input,
          OnInit }     from '@angular/core';

import { faLeftLong }  from '@fortawesome/free-solid-svg-icons';


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
  faLeftLong = faLeftLong;

  constructor() { }


  ngOnInit(): void {
  }

}
