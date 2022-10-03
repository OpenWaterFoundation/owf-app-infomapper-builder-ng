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
   * @param menuChoice 
   */
  addNodeToTree(treeNodeData: IM.TreeNodeData, menuChoice: IM.MenuChoice): void {

    var topMainMenuNode = treeNodeData.children[1];

    if (menuChoice.node.level === 'Application') {

      if (menuChoice.choiceType === 'addDatastore') {
        treeNodeData.children[0].children.push({
          level: 'Datastore',
          name: 'New Datastore',
          index: treeNodeData.children[0].children.length
        });
      }
      else if (menuChoice.choiceType === 'addMainMenu') {
        topMainMenuNode.children.push({
          level: 'Main Menu',
          name: 'New Main Menu',
          index: topMainMenuNode.children.length
        });
      }
    }
    // 
    else if (menuChoice.node.level === 'Main Menu') {

      if (!topMainMenuNode.children[menuChoice.node.index].children) {
        topMainMenuNode.children[menuChoice.node.index].children = [];
      }
      topMainMenuNode.children[menuChoice.node.index].children.push({
        level: 'SubMenu',
        name: 'New SubMenu',
        index: topMainMenuNode.children[menuChoice.node.index].children.length,
        parentIndex: menuChoice.node.index
      });
    }
  }

  /**
   * Removes all children object elements in the provided array.
   * @param allChildren Array of all children nodes to remove.
   */
  private removeAllChildren(allChildren: IM.TreeNodeData[]): void {
    allChildren.splice(0, allChildren.length);
  }

  /**
   * Removes the provided TreeNodeData - and any children nodes if present  - from 
   * the treeNodeData structure.
   * @param treeNodeData The top level Application TreeNodeData object will all
   * its children nodes.
   * @param node The node to remove, including all its children nodes if present.
   */
  removeNodeFromTree(treeNodeData: IM.TreeNodeData, node: IM.TreeNodeData) {

    var topDatastoreNode = treeNodeData.children[0];
    var topMainMenuNode = treeNodeData.children[1];

    if (node.level === 'Datastore') {
      topDatastoreNode.children.splice(topDatastoreNode.children.indexOf(topDatastoreNode.children[node.index]), 1);
    } else if (node.level === 'Main Menu') {
      // Check if this Main Menu has any children and delete them first.
      if (topMainMenuNode.children[node.index].children) {
        if (topMainMenuNode.children[node.index].children.length > 0) {
          this.removeAllChildren(topMainMenuNode.children[node.index].children);
        }
      }
      topMainMenuNode.children.splice(topMainMenuNode.children.indexOf(topMainMenuNode.children[node.index]), 1);
    } else if (node.level === 'SubMenu') {
      var allSubMenus = topMainMenuNode.children[node.parentIndex].children;
      allSubMenus.splice(allSubMenus.indexOf(allSubMenus[node.index]), 1);
    }
  }

}
