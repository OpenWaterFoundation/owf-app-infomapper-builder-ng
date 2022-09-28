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
   * @param node 
   */
  addNodeToTree(treeNodeData: IM.TreeNodeData, node: IM.TreeNodeData): void {

    if (node.level === 'Application') {
      treeNodeData.children.push({
        level: 'Main Menu',
        name: 'New Main Menu',
        index: treeNodeData.children.length
      });
    } else if (node.level === 'Main Menu') {

      if (!treeNodeData.children[node.index].children) {
        treeNodeData.children[node.index].children = [];
      }

      treeNodeData.children[node.index].children.push({
        level: 'SubMenu',
        name: 'New SubMenu',
        index: treeNodeData.children[node.index].children.length,
        parentIndex: node.index
      });
    }
  }

  private removeAllChildren(allChildren: IM.TreeNodeData[]): void {
    allChildren.splice(0, allChildren.length);
  }

  /**
   * 
   * @param treeNodeData 
   * @param node 
   */
  removeNodeFromTree(treeNodeData: IM.TreeNodeData, node: IM.TreeNodeData) {

    if (node.level === 'Main Menu') {
      // Check if this Main Menu has any children and delete them first.
      if (treeNodeData.children[node.index].children) {
        if (treeNodeData.children[node.index].children.length > 0) {
          this.removeAllChildren(treeNodeData.children[node.index].children);
        }
      }
      treeNodeData.children.splice(treeNodeData.children.indexOf(treeNodeData.children[node.index]), 1);
    } else if (node.level === 'SubMenu') {

      var allSubMenus = treeNodeData.children[node.parentIndex].children;

      allSubMenus.splice(allSubMenus.indexOf(allSubMenus[node.index]), 1);
    }
  }

}
