import { Component,
          EventEmitter,
          Input,
          OnInit,
          Output }                 from '@angular/core';

import { faEllipsisVertical }      from '@fortawesome/free-solid-svg-icons';

import * as IM                     from '@OpenWaterFoundation/common/services';

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
  @Output('menuChoice') menuChoice = new EventEmitter<IM.MenuChoice>();;
  /**
   * 
   */
  @Input('node') node: IM.TreeNodeData;




  constructor() { }


  ngOnInit(): void {
  }

  /**
   * 
   * @param nodeName 
   * @param menuChoice 
   */
  sendMenuChoice(nodeName: string, menuChoice: string): void {
    this.menuChoice.emit({
      nodeName: nodeName,
      menuChoice: menuChoice
    });
  }

}
