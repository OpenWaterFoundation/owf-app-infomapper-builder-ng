import * as IM from '@OpenWaterFoundation/common/services';

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

  menuCounter = 1;

  subMenuCounter = 1;


  /**
   * A private constructor is declared so any instance of the class cannot be created elsewhere, getInstance must be called.
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
   * @param nodeName 
   */
  addNodeToTree(treeNodeData: IM.TreeNodeData, nodeName: string): void {

    if (nodeName.includes('Application:')) {
      treeNodeData.children.push({name: 'Menu: New menu ' + this.menuCounter});
      ++this.menuCounter;
    } else if (nodeName.includes('Menu:')) {

      let menuIndex = +nodeName.slice(-1);

      if (!treeNodeData.children[menuIndex - 1].children) {
        treeNodeData.children[menuIndex - 1].children = [];
      }

      treeNodeData.children[menuIndex - 1].children.push({
        name: 'SubMenu: New subMenu ' + this.subMenuCounter
      });
      ++this.subMenuCounter;
    }
  }

}
