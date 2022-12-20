import { Component,
          EventEmitter,
          Input,
          OnInit,
          Output }                 from '@angular/core';
import { Observable }              from 'rxjs';

import { faEllipsisVertical }      from '@fortawesome/free-solid-svg-icons';

import * as IM                     from '@OpenWaterFoundation/common/services';
import { BuildManager }            from '../../build-manager';


@Component({
  selector: 'tree-node-menu',
  templateUrl: './tree-node-menu.component.html',
  styleUrls: ['./tree-node-menu.component.scss']
})
export class NodeMenuComponent implements OnInit {

  /** Singleton BuildManager instance to uniquely add different nodes to the
   * displayed tree. */
  buildManager: BuildManager = BuildManager.getInstance();
  /** All used FontAwesome icons in the NodeMenuComponent. */
  faEllipsisVertical = faEllipsisVertical;
  /** The selected menu choice to send back to the ConfigDialogComponent. */
  @Output('sendMenuChoice') menuChoice = new EventEmitter<IM.MenuChoice>();
  /** The current tree node, passed in as input from the Build Component. */
  @Input('node') node: IM.TreeNodeData;
  

  /**
   * The constructor for the NodeMenuComponent.
   */
  constructor() { }


  /**
   * 
   */
  get validAppSaveState(): Observable<boolean> {
    return this.buildManager.isAppInSavedState();
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
   */
  ngOnInit(): void {
  }

  /**
   * Sends the selected menu choice back to the Build Component.
   * @param node
   * @param menuChoiceType 
   */
  sendMenuChoice(node: IM.TreeFlatNode, menuChoiceType: string): void {
    this.menuChoice.emit({
      choiceType: menuChoiceType,
      node: node
    });
  }

}
