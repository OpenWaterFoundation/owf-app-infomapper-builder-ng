import { FormGroup }      from '@angular/forms';
import { BehaviorSubject,
          Observable }    from 'rxjs';

import * as IM            from '@OpenWaterFoundation/common/services';
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
  private totalSavedNodesInTree = 0;
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
    }
    else if (choice.choiceType === 'addMainMenu') {
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
    else if (choice.choiceType === 'addSubMenu') {
      var nodeIndex = this.getNodeIndex(choice.node);

      if (!this.treeNodeData[0].children[1].children[nodeIndex].children) {
        this.treeNodeData[0].children[1].children[nodeIndex].children = [];
      }
      var mainMenuNodeChildren = this.treeNodeData[0].children[1].children[nodeIndex].children;

      // Toggle the Main Menu when the first SubMenu is added.
      if (mainMenuNodeChildren.length === 0) {
        expansionModel.select('0/1/' + nodeIndex);
      }
      mainMenuNodeChildren.push({
        level: 'SubMenu',
        name: 'New SubMenu',
        id: choice.node.id + '/' + mainMenuNodeChildren.length,
        saved: false
      })
    }
    // Increment the total number of nodes in the tree. Used for determining if
    // all nodes have been saved.
    ++this.totalNodesInTree;

    this.dataChange.next(this.treeNodeData);
  }

  /**
   * Performs one of the following 3 actions:
   *   * Creates the `datastores` property array and assigns an empty object.
   *   * Returns if the node has already been saved.
   *   * Pushes a empty object so it can be populated with the filled out FormGroup.
   * @param node The current tree node.
   */
   private confirmDatastoreExists(node: IM.TreeFlatNode): void {
    if (!this.builderJSON.datastores) {
      this.builderJSON.datastores = [{}];
    }
    else if (node.saved) {
      return;
    }
    else {
      this.builderJSON.datastores.push({});
    }
  }

  /**
   * Performs one of the following 3 actions:
   *   * Creates the `mainMenu` property array and assigns an empty object.
   *   * Returns if the node has already been saved.
   *   * Pushes a empty object so it can be populated with the filled out FormGroup.
   * @param node The current tree node.
   */
  private confirmMainMenuExists(node: IM.TreeFlatNode): void {
    if (!this.builderJSON.mainMenu) {
      this.builderJSON.mainMenu = [{}];
    }
    else if (node.saved) {
      return;
    }
    else {
      this.builderJSON.mainMenu.push({});
    }
  }

  /**
   * Performs one of the following 3 actions:
   *   * Creates the `menus` property array in the correct MainMenu array and assigns
   *     an empty object.
   *   * Returns if the node has already been saved.
   *   * Pushes a empty object so it can be populated with the filled out FormGroup.
   * @param node The current tree node.
   */
  private confirmSubMenuExists(node: IM.TreeFlatNode): void {

    var parentIndex = this.getNodeParentIndex(node);
    // Check if the empty SubMenus exist and create the ones that don't yet.
    if (!this.builderJSON.mainMenu[parentIndex].menus) {
      this.builderJSON.mainMenu[parentIndex].menus = [{}];
    }
    else if (node.saved) {
      return;
    }
    else {
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
   * Checks if the number of total nodes in the flat tree equals the amount of nodes
   * that have been saved.
   * @returns True if all nodes have been saved, and false otherwise.
   */
  isAppInSavedState(): Observable<boolean> {

    if (this.totalNodesInTree === this.totalSavedNodesInTree) {
      this.validAppSaveState.next(true);
    } else {
      this.validAppSaveState.next(false);
    }
    return this.validAppSaveState.asObservable();
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
    if (node.saved) {
      --this.totalSavedNodesInTree;
    }
    

    var topDatastoreNode = this.treeNodeData[0].children[0];
    var topMainMenuNode = this.treeNodeData[0].children[1];
    var nodeIndex = this.getNodeIndex(node);
    var parentIndex = this.getNodeParentIndex(node);

    if (node.level === 'Datastore') {
      topDatastoreNode.children.splice(topDatastoreNode.children.indexOf(topDatastoreNode.children[nodeIndex]), 1);

      this.updateAllNodeIds(topDatastoreNode.children);
    }
    else if (node.level === 'Main Menu') {
      // Check if this Main Menu has any children and delete them first.
      if (topMainMenuNode.children[nodeIndex].children) {
        if (topMainMenuNode.children[nodeIndex].children.length > 0) {
          this.removeAllChildren(topMainMenuNode.children[nodeIndex].children);
        }
      }
      topMainMenuNode.children.splice(topMainMenuNode.children.indexOf(topMainMenuNode.children[nodeIndex]), 1);

      this.updateAllNodeIds(topMainMenuNode.children)
    }
    else if (node.level === 'SubMenu') {
      var allSubMenus = topMainMenuNode.children[parentIndex].children;
      allSubMenus.splice(allSubMenus.indexOf(allSubMenus[nodeIndex]), 1);
      this.updateAllNodeIds(allSubMenus);
    }
  }

  /**
   * Saves the provided FormGroup to the builderJSON business object, and increments
   * the amount of saved nodes if the current node isn't already saved.
   * @param resultForm The filled out FormGroup from the closed dialog component.
   * @param node The current tree node.
   */
  saveToBuilderJSON(resultForm: FormGroup, node: IM.TreeFlatNode): void {

    if (!node.saved) {
      ++this.totalSavedNodesInTree;
    }

    for (let property of Object.keys(resultForm)) {
      if (resultForm[property] == '') {
        delete resultForm[property];
      }
    }
    console.log('Form to be saved:', JSON.stringify(resultForm, null, 4));

    var nodeIndex = this.getNodeIndex(node);
    var parentIndex = this.getNodeParentIndex(node);

    if (node.level === 'Application') {
      Object.assign(this.builderJSON, resultForm);
      this.treeNodeData[0].saved = true;
    }
    else if (node.level === 'Datastore') {
      this.confirmDatastoreExists(node);
      Object.assign(this.builderJSON.datastores[nodeIndex], resultForm);
      this.treeNodeData[0].children[0].children[nodeIndex].saved = true;
    }
    else if (node.level === 'Main Menu') {
      this.confirmMainMenuExists(node);
      Object.assign(this.builderJSON.mainMenu[nodeIndex], resultForm);
      this.treeNodeData[0].children[1].children[nodeIndex].saved = true;
    }
    else if (node.level === 'SubMenu') {
      this.confirmSubMenuExists(node);
      Object.assign(this.builderJSON.mainMenu[parentIndex].menus[nodeIndex], resultForm);
      this.treeNodeData[0].children[1].children[parentIndex].children[nodeIndex].saved = true;
    }

    this.dataChange.next(this.treeNodeData);
  }

   /**
   * Sets the provided treeNodeData array as the builderTree object. Used for tree
   * persistence on user app navigation.
   * @param treeNodeData The array of objects to be set as the new builtTree.
   */
  updateBuilderTree(treeNodeData: IM.TreeNodeData[]): void {
    Object.assign(this.builderTree, treeNodeData);
  }

  /**
   * Update the builderJSON object when a node has been dragged and dropped in a
   * new location.
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
        var nodeToInsertParentIndex = this.getNodeParentIndex(nodeToInsert);
        var removedSubMenu = this.builderJSON.mainMenu[nodeToInsertParentIndex].menus.splice(nodeToInsertIndex, 1)[0];
        this.builderJSON.mainMenu[nodeToInsertParentIndex].menus.splice(destNodeIndex, 0, removedSubMenu);
    }
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
