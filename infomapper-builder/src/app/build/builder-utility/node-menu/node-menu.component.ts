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
   * @param node
   * @param menuChoiceType 
   */
  sendMenuChoice(node: IM.TreeNodeData, menuChoiceType: string): void {
    this.menuChoice.emit({
      choiceType: menuChoiceType,
      node: node
    });
  }

}
