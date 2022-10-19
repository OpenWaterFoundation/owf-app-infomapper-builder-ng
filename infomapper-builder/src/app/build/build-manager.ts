import { FormGroup }   from '@angular/forms';
import { BehaviorSubject,
          Observable } from 'rxjs';

import * as IM         from '@OpenWaterFoundation/common/services';
import { SelectionModel } from '@angular/cdk/collections';



/**
 * A helper singleton class for creating, managing and maintaining objects used by
 * the IM Builder. This includes:
 *   * The builderJSON business object, used to write, save, and publish the final
 *     JSON object created by the IM Builder 
 */
// @dynamic
export class BuildManager {
  
  /** The object used to create the final app configuration file. (?) */
  private builderJSON: IM.AppConfig = { title: '', homePage: '', version: '' };
  /** The persisted tree object used between application URL changes. This is so
   * the tree isn't created from scratch upon new Build Component construction if
   * it doesn't have to be. */
  private builderTree: IM.TreeNodeData[] = [];
  /**
   * 
   */
  dataChange = new BehaviorSubject<IM.TreeNodeData[]>([]);
  /** The instance of this WindowManager object. */
  private static instance: BuildManager;
  /**
   * 
   */
  private totalNodesInTree = 1;
  /**
   * 
   */
  private treeNodeData: IM.TreeNodeData[] = [
    {
      level: 'Application',
      name: 'New application',
      id: '0',
      saved: false,
      children: [
        {
          level: 'Datastores',
          name: 'Datastores',
          id: '0/0',
          children: []
        },
        {
          level: 'Main Menus',
          name: 'Main Menus',
          id: '0/1',
          children: []
        }
      ]
    }
  ];
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
  private constructor() {
    this.initialize();
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

  get treeData(): IM.TreeNodeData[] {
    return this.dataChange.value;
  }

  /**
   * 
   * @param choice 
   */
  addNodeToTree(choice: IM.MenuChoice, expansionModel: SelectionModel<string>): void {

    if (choice.choiceType === 'addDatastore') {
      // Toggle the first added Datastore on the expanded selection model.
      if (this.treeNodeData[0].children[0].children.length === 0) {
        expansionModel.select('0/0');
      }
      this.treeNodeData[0].children[0].children.push({
        level: 'Datastore',
        name: 'New Datastore',
        id: '0/0/' + this.treeNodeData[0].children[0].children.length,
        saved: false,
      } as IM.TreeNodeData);
    } else if (choice.choiceType === 'addMainMenu') {
      // Toggle the first added Main Menu on the expanded selection model.
      if (this.treeNodeData[0].children[1].children.length === 0) {
        expansionModel.select('0/1');
      }
      this.treeNodeData[0].children[1].children.push({
        level: 'Main Menu',
        name: 'New Main Menu',
        id: '0/1/' + this.treeNodeData[0].children[1].children.length,
        saved: false,
      } as IM.TreeNodeData);
    }
    // Increment the total number of nodes in the tree. Used for determining if
    // all nodes have been saved.
    ++this.totalNodesInTree;

    this.dataChange.next(this.treeNodeData);
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

    var parentIndex = this.getNodeParentIndex(node);

    // Check if the empty SubMenus exist and create the ones that don't yet.
    if (!this.builderJSON.mainMenu[parentIndex].menus) {
      this.builderJSON.mainMenu[parentIndex].menus = [{}];
    } else {
      this.builderJSON.mainMenu[parentIndex].menus.push({});
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
   */
  addSavedNode(saved: boolean) {
    this.validAppSaveState.next(saved);
  }

  /**
   * 
   */
  getNodeIndex(node: IM.TreeFlatNode | IM.TreeNodeData): number {
    return +node.id.charAt(node.id.length - 1);
  }

  /**
   * 
   */
  getNodeParentIndex(node: IM.TreeFlatNode | IM.TreeNodeData): number {
    return +node.id.charAt(node.id.length - 3);
  }

  /**
   * 
   */
  private initialize(): void {
    this.dataChange.next(this.treeNodeData);
  }

  /**
   * 
   * @returns 
   */
  isAppInSavedState(): Observable<boolean> {

    // if (this.totalNodesInTree === Object.keys(this.nodeSaved).length) {
    //   this.validAppSaveState.next(true);
    // } else {
    //   this.validAppSaveState.next(false);
    // }
    // return this.validAppSaveState.asObservable();
    return;
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
  removeFromBuilderJSON(node: IM.TreeFlatNode): void {

    var nodeIndex = this.getNodeIndex(node);
    var parentIndex = this.getNodeParentIndex(node);

    if (node.level === 'Datastore') {
      // No Datastore node has been saved, so there's nothing to remove from either
      // the builderJSON or nodeSaved objects.
      if (!this.builderJSON.datastores) {
        return;
      }
      // Set this node's save state to false.
      node.saved = false;

      // Remove the Datastore from the builderJSON business object, and its property
      // if there are none left.
      if (this.builderJSON.datastores) {
        this.builderJSON.datastores.splice(nodeIndex, 1);

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
      // Set this node's save state to false.
      node.saved = false;

      // Remove the Main Menu from the builderJSON business object, and its property
      // if there are none left.
      if (this.builderJSON.mainMenu) {
        this.builderJSON.mainMenu.splice(nodeIndex, 1);

        if (this.builderJSON.mainMenu.length === 0) {
          delete this.builderJSON.mainMenu;
        }
      }
    }
    else if (node.level === 'SubMenu') {
      // Set this node's save state to false.
      node.saved = false;
      // Remove the SubMenu from the builderJSON business object, and its property
      // if there are none left.
      if (this.builderJSON.mainMenu[parentIndex].menus) {
        this.builderJSON.mainMenu[parentIndex].menus.splice(nodeIndex, 1);

        if (this.builderJSON.mainMenu[parentIndex].menus.length === 0) {
          delete this.builderJSON.mainMenu[parentIndex].menus;
        }
      }
    }
  }

  /**
   * Removes the provided TreeNodeData, and any children nodes if present, from 
   * the treeNodeData structure. Also reassigns each remaining node with an updated
   * id/index if applicable.
   * @param node The node to remove, including all its children nodes if present.
   */
  removeNodeFromTree(node: IM.TreeFlatNode) {

    --this.totalNodesInTree;

    var topDatastoreNode = this.treeNodeData[0].children[0];
    var topMainMenuNode = this.treeNodeData[0].children[1];
    var nodeIndex = this.getNodeIndex(node);
    var parentIndex = this.getNodeParentIndex(node);

    if (node.level === 'Datastore') {
      topDatastoreNode.children.splice(topDatastoreNode.children.indexOf(topDatastoreNode.children[nodeIndex]), 1);

      this.updateAllNodeIds(topDatastoreNode.children);
    } else if (node.level === 'Main Menu') {
      // Check if this Main Menu has any children and delete them first.
      if (topMainMenuNode.children[nodeIndex].children) {
        if (topMainMenuNode.children[nodeIndex].children.length > 0) {
          this.removeAllChildren(topMainMenuNode.children[nodeIndex].children);
        }
      }
      topMainMenuNode.children.splice(topMainMenuNode.children.indexOf(topMainMenuNode.children[nodeIndex]), 1);

      this.updateAllNodeIds(topMainMenuNode.children)
    } else if (node.level === 'SubMenu') {
      var allSubMenus = topMainMenuNode.children[parentIndex].children;
      allSubMenus.splice(allSubMenus.indexOf(allSubMenus[nodeIndex]), 1);

      this.updateAllNodeIds(allSubMenus);
    }
  }

  /**
   * 
   * @param resultForm 
   * @param node 
   */
  saveToBuilderJSON(resultForm: FormGroup, node: IM.TreeNodeData): void {

    var nodeIndex = this.getNodeIndex(node);
    var parentIndex = this.getNodeParentIndex(node);

    if (node.level === 'Application') {
      Object.assign(this.builderJSON, resultForm);
      this.treeNodeData[0].saved = true;
    } else if (node.level === 'Datastore') {
      this.confirmDatastoreExists();
      Object.assign(this.builderJSON.datastores[nodeIndex], resultForm);
    } else if (node.level === 'Main Menu') {
      this.confirmMainMenuExists();
      Object.assign(this.builderJSON.mainMenu[nodeIndex], resultForm);
    } else if (node.level === 'SubMenu') {
      this.confirmSubMenuExists(node);
      Object.assign(this.builderJSON.mainMenu[parentIndex].menus[nodeIndex], resultForm);
    }

    this.dataChange.next(this.treeNodeData);
  }

   /**
   * 
   * @param treeNodeData 
   */
  updateBuilderTree(treeNodeData: IM.TreeNodeData[]): void {
    Object.assign(this.builderTree, treeNodeData);
  }

  /**
   * 
   */
  updateBuilderJSON(destNodeIndex: number, nodeToInsertIndex: number, nodeToInsert: IM.TreeNodeData): void {

    switch(nodeToInsert.level) {
      case 'Datastore':
        var removedDatastore = this.builderJSON.datastores.splice(nodeToInsertIndex, 1)[0];
        this.builderJSON.datastores.splice(destNodeIndex, 0, removedDatastore);
        break;
      case 'Main Menu':
        var removedMainMenu = this.builderJSON.mainMenu.splice(nodeToInsertIndex, 1)[0];
        this.builderJSON.mainMenu.splice(destNodeIndex, 0, removedMainMenu);
        break;
      case 'SubMenu':
        // var removedSubMenu = this.builderJSON.ma
    }
    console.log('BuilderJSON:', this.builderJSON);
  }

  /**
   * TODO: Maybe arrayOfNodes is TreeNodeData
   * @param arrayOfNodes 
   */
  updateAllNodeIds(arrayOfNodes: IM.TreeNodeData[]): void {
    arrayOfNodes.map((treeDataNode: IM.TreeNodeData, i: number) => {
      treeDataNode.id = treeDataNode.id.slice(0, -1) + i;
    });
  }
}
