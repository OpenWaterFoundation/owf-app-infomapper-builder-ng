import { Component,
          EventEmitter,
          Input,
          OnInit,
          Output }                 from '@angular/core';
import { Observable }              from 'rxjs';

import { faEllipsisVertical }      from '@fortawesome/free-solid-svg-icons';

import { AppService }              from 'src/app/app.service';
import * as IM                     from '@OpenWaterFoundation/common/services';


@Component({
  selector: 'node-menu',
  templateUrl: './node-menu.component.html',
  styleUrls: ['./node-menu.component.scss']
})
export class NodeMenuComponent implements OnInit {

  /** All used FontAwesome icons in the NodeMenuComponent. */
  faEllipsisVertical = faEllipsisVertical;
  /** The selected menu choice to send back to the DialogComponent. */
  @Output('menuChoice') menuChoice = new EventEmitter<IM.MenuChoice>();
  /** The current tree node, passed in as input from the Build Component. */
  @Input('node') node: IM.TreeNodeData;
  

  constructor(private appService: AppService) { }


  get validState(): Observable<boolean> {
    return this.appService.validSaveState$;
  }

  ngOnInit(): void {
  }

  /**
   * Sends the selected menu choice back to the Build Component.
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
