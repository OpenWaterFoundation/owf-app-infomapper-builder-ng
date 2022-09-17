import { Component,
          Input,
          OnInit,
          Output }            from '@angular/core';

import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'node-menu',
  templateUrl: './node-menu.component.html',
  styleUrls: ['./node-menu.component.scss']
})
export class NodeMenuComponent implements OnInit {

  /** All used FontAwesome icons in the NodeMenuComponent. */
  faEllipsisVertical = faEllipsisVertical;
  /**
   * 
   */
  @Input('node') node: any;




  constructor() { }


  ngOnInit(): void {
  }

}
