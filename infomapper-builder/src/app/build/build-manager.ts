import * as IM        from '@OpenWaterFoundation/common/services';

import { AppService } from '../app.service';

/**
 * A helper singleton class for creating, managing and maintaining multiple opened Material Dialogs (WindowManagerItem object)
 * while viewing a map in the Infomapper. The fact that it is singleton is important, as it allows the building of a unique
 * name using a number to signify how many windows have been opened. The (at)dynamic line below needs to be declared before
 * classes that declares static methods.
 */
// @dynamic
export class BuildManager {
  
  /** The instance of this WindowManager object. */
  private static instance: BuildManager;
  /**
   * Number to be appended to each Main Menu
   */
  mainMenuCounter = 1;
  /**
   * 
   */
  subMenuCounter = 1;


  /**
   * A private constructor is declared so any instance of the class cannot be
   * created elsewhere, getInstance must be called.
   */
  private constructor() { }


  /**
   * Only one instance of this WindowManager can be used at one time, making it a singleton Class.
   */
  static getInstance(): BuildManager {
    if (!BuildManager.instance) { BuildManager.instance = new BuildManager(); }
    return BuildManager.instance;
  }

  /**
   * 
   * @param treeNodeData 
   * @param parentNode 
   */
  addNodeToTree(treeNodeData: IM.TreeNodeData, parentNode: IM.TreeNodeData): void {

    if (parentNode.level === 'Application') {
      treeNodeData.children.push({
        level: 'Main Menu',
        name: 'New menu ' + this.mainMenuCounter,
        index: treeNodeData.children.length
      });
      ++this.mainMenuCounter;
    } else if (parentNode.level === 'Main Menu') {

      if (!treeNodeData.children[parentNode.index].children) {
        treeNodeData.children[parentNode.index].children = [];
      }

      treeNodeData.children[parentNode.index].children.push({
        level: 'SubMenu',
        name: 'New SubMenu ' + this.subMenuCounter,
        index: treeNodeData.children[parentNode.index].children.length,
        parentIndex: parentNode.index
      });
      ++this.subMenuCounter;
    }
  }

}
