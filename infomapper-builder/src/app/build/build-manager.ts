import { FormGroup }   from '@angular/forms';
import { BehaviorSubject,
          Observable } from 'rxjs';

import * as IM         from '@OpenWaterFoundation/common/services';



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
  /** The object used to create the final app configuration file. (?) */
  private builderJSON: IM.AppConfig = { title: '', homePage: '', version: '' };
  /** The persisted tree object used between application URL changes. This is so
   * the tree isn't created from scratch upon new Build Component construction if
   * it doesn't have to be. */
  private builderTree: IM.TreeNodeData[] = [];
  /** Each node that has been saved will be added with the following key/value pair:
   *   * key - Node level with the index/indexes appended, e.g. `Main Menu 2`
   * or `SubMenu 1,2`.
   *   * value - The boolean `true`.
   */
  private nodeSaved = {};
  /**
   * 
   */
  private totalNodesInTree = 1;
  /**
   * 
   */
  private validAppSaveState = new BehaviorSubject<boolean>(false);
  /**
   * 
   */
  private validNodeSaveState = new BehaviorSubject<boolean>(false);


  /**
   * A private constructor is declared so any instance of the class cannot be
   * created elsewhere, getInstance must be called.
   */
  private constructor() { }


  /**
   * 
   */
  get allSavedNodes(): any {
    return this.nodeSaved;
  }

  /**
   * 
   */
  get builtTree(): IM.TreeNodeData[] {
    return this.builderTree;
  }

  /**
   * Getter for the entire AppConfig object, used to write to a JSON file as the
   * `app-config.json`.
   */
  get fullBuilderJSON(): IM.AppConfig {
    return this.builderJSON;
  }

  /**
   * 
   */
   private confirmDatastoreExists(): void {
    if (!this.builderJSON.datastores) {
      this.builderJSON.datastores = [{}];
    } else {
      this.builderJSON.datastores.push({});
    }
  }

  /**
   * 
   */
  private confirmMainMenuExists(): void {
    if (!this.builderJSON.mainMenu) {
      this.builderJSON.mainMenu = [{}];
    } else {
      this.builderJSON.mainMenu.push({});
    }
  }

  /**
   * 
   * @param node 
   */
  private confirmSubMenuExists(node: IM.TreeNodeData): void {

    // Check if the empty SubMenus exist and create the ones that don't yet.
    if (!this.builderJSON.mainMenu[node.parentIndex].menus) {
      this.builderJSON.mainMenu[node.parentIndex].menus = [{}];
    } else {
      this.builderJSON.mainMenu[node.parentIndex].menus.push({});
    }
  }

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

    ++this.totalNodesInTree;

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
   * 
   */
  addSavedNode(saved: boolean) {
    this.validAppSaveState.next(saved);
  }

  /**
   * Checks if the current node's form has been saved before.
   * @param nodeLevel The tree node level.
   * @returns True if the node config has been previously saved.
   */
  hasNodeBeenSaved(nodeLevel: string): boolean {
    return this.nodeSaved[nodeLevel];
  }

  /**
   * 
   * @returns 
   */
  isAppInSavedState(): Observable<boolean> {

    if (this.totalNodesInTree === Object.keys(this.nodeSaved).length) {
      this.validAppSaveState.next(true);
    } else {
      this.validAppSaveState.next(false);
    }
    return this.validAppSaveState.asObservable();
  }

  /**
   * 
   * @param node 
   * @returns 
   */
  isNodeInSavedState(node: IM.TreeNodeData): Observable<boolean> {
    
    switch(node.level) {
      case 'Application':
        if (this.nodeSaved[node.level]) {
          this.validNodeSaveState.next(true);
          return this.validNodeSaveState.asObservable();
        }
        break;
      case 'Datastore':
      case 'Main Menu':
        if (this.nodeSaved[node.level + ' ' + node.index]) {
          this.validNodeSaveState.next(true);
          return this.validNodeSaveState.asObservable();
        }
        break;
      case 'SubMenu':
        if (this.nodeSaved[node.level + ' ' + node.parentIndex + ',' + node.index]) {
          this.validNodeSaveState.next(true);
          return this.validNodeSaveState.asObservable();
        }
        break;
    }
    this.validNodeSaveState.next(false);
    return this.validNodeSaveState.asObservable();
  }

  /**
   * Removes all children object elements in the provided array.
   * @param allChildren Array of all children nodes to remove.
   */
  private removeAllChildren(allChildren: IM.TreeNodeData[]): void {
    allChildren.splice(0, allChildren.length);
  }

  /**
   * Uses one or both indexes in the tree node to delete its object from the
   * builderJSON (publishing) and nodeSaved (determining which nodes have been
   * saved) objects.
   * @param node The tree node being deleted, used as reference to remove it from
   * the builderJSON business object.
   */
  removeFromBuilderJSON(node: IM.TreeNodeData): void {

    if (node.level === 'Datastore') {
      // No Datastore node has been saved, so there's nothing to remove from either
      // the builderJSON or nodeSaved objects.
      if (!this.builderJSON.datastores) {
        return;
      }
      // Remove this node from the nodeSaved object.
      delete this.nodeSaved['Datastore ' + node.index];

      // Remove the Datastore from the builderJSON business object, and its property
      // if there are none left.
      if (this.builderJSON.datastores) {
        this.builderJSON.datastores.splice(node.index, 1);

        if (this.builderJSON.datastores.length === 0) {
          delete this.builderJSON.datastores;
        }
      }
    }
    else if (node.level === 'Main Menu') {
      // No Main Menu node has been saved, so there's nothing to remove from either
      // the builderJSON or nodeSaved objects.
      if (!this.builderJSON.mainMenu) {
        return;
      }
      // Remove this node from the nodeSaved object.
      delete this.nodeSaved['Main Menu ' + node.index];

      // Remove the Main Menu from the builderJSON business object, and its property
      // if there are none left.
      if (this.builderJSON.mainMenu) {
        this.builderJSON.mainMenu.splice(node.index, 1);

        if (this.builderJSON.mainMenu.length === 0) {
          delete this.builderJSON.mainMenu;
        }
      }
    }
    else if (node.level === 'SubMenu') {
      // Remove this node from the nodeSaved object.
      delete this.nodeSaved['SubMenu ' + node.parentIndex + ',' + node.index];
      // Remove the SubMenu from the builderJSON business object, and its property
      // if there are none left.
      if (this.builderJSON.mainMenu[node.parentIndex].menus) {
        this.builderJSON.mainMenu[node.parentIndex].menus.splice(node.index, 1);

        if (this.builderJSON.mainMenu[node.parentIndex].menus.length === 0) {
          delete this.builderJSON.mainMenu[node.parentIndex].menus;
        }
      }
    }
  }

  /**
   * Removes the provided TreeNodeData - and any children nodes if present  - from 
   * the treeNodeData structure.
   * @param treeNodeData The top level Application TreeNodeData object will all
   * its children nodes.
   * @param node The node to remove, including all its children nodes if present.
   */
  removeNodeFromTree(treeNodeData: IM.TreeNodeData, node: IM.TreeNodeData) {

    --this.totalNodesInTree;

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

  /**
   * 
   * @param resultForm 
   * @param node 
   */
  saveToBuilderJSON(resultForm: FormGroup, node: IM.TreeNodeData): void {

    if (node.level === 'Application') {
      Object.assign(this.builderJSON, resultForm);
      this.nodeSaved['Application'] = true;
    } else if (node.level === 'Datastore') {
      this.confirmDatastoreExists();
      Object.assign(this.builderJSON.datastores[node.index], resultForm);
      this.nodeSaved['Datastore ' + node.index] = true;
    } else if (node.level === 'Main Menu') {
      this.confirmMainMenuExists();
      Object.assign(this.builderJSON.mainMenu[node.index], resultForm);
      this.nodeSaved['Main Menu ' + node.index] = true;
    } else if (node.level === 'SubMenu') {
      this.confirmSubMenuExists(node);
      Object.assign(this.builderJSON.mainMenu[node.parentIndex].menus[node.index], resultForm);
      this.nodeSaved['SubMenu ' + node.parentIndex + ',' + node.index] = true;
    }
  }

   /**
   * 
   * @param treeNodeData 
   */
  updateBuilderTree(treeNodeData: IM.TreeNodeData[]): void {
    Object.assign(this.builderTree, treeNodeData);
  }
}
