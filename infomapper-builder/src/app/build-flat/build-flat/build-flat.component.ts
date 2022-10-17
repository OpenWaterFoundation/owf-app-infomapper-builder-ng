import { Component,
          OnDestroy,
          OnInit }                from '@angular/core';
import { AbstractControl,
          FormControl,
          FormGroup,
          ValidationErrors,
          ValidatorFn,
          Validators }                  from '@angular/forms';
import { ActivatedRoute,
          ParamMap }                    from '@angular/router';
import { MatDialog,
          MatDialogConfig,
          MatDialogRef }                from '@angular/material/dialog';
import { MatSnackBar,
          MatSnackBarHorizontalPosition,
          MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatTreeFlatDataSource,
          MatTreeFlattener }            from '@angular/material/tree';
import { BreakpointObserver,
          Breakpoints }                 from '@angular/cdk/layout';
import { SelectionModel }               from '@angular/cdk/collections';
import { CdkDragDrop }                  from '@angular/cdk/drag-drop';
import { FlatTreeControl }              from '@angular/cdk/tree';

import { faChevronDown,
          faChevronRight,
          faTriangleExclamation }       from '@fortawesome/free-solid-svg-icons';

import { first,
          Observable,
          of,
          Subject,
          takeUntil }                   from 'rxjs';

import * as IM                          from '@OpenWaterFoundation/common/services';

import { AppService }                   from '../../app.service';
import { DialogComponent }              from '../../build/builder-utility/dialog/dialog.component';
import { BuildManager }                 from '../../build/build-manager';


@Component({
  selector: 'app-build-flat',
  templateUrl: './build-flat.component.html',
  styleUrls: ['./build-flat.component.scss'],
  providers: []
})
export class BuildFlatComponent implements OnInit, OnDestroy {
 
  /** The main FormGroup for the entire application. */
  appBuilderForm = new FormGroup({});
  /** FormGroup used by the AppConfigComponent. */
  appConfigFG = new FormGroup({
    title: new FormControl('', Validators.required),
    homePage: new FormControl({ value: '/content-page/home.md', disabled: true }),
    version: new FormControl('', Validators.required),
    dataUnitsPath: new FormControl(''),
    favicon: new FormControl('favicon.ico'),
    googleAnalyticsTrackingId: new FormControl('')
  });
  /** Singleton BuildManager instance to uniquely add different nodes to the
  * displayed tree. */
  buildManager: BuildManager = BuildManager.getInstance();
  /** The current screen size. Used for dialogs to determine if they
  * should be shown for desktop or mobile screens. */
  currentScreenSize: string;
  /** FormGroup used by the DatastoreComponent. */
  datastoreFG = new FormGroup({
    name: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    rootUrl: new FormControl('', Validators.required),
    aliases: new FormControl(''),
    apiKey: new FormControl('')
  });
  /** Subject that is completed when this component is destroyed. */
  destroyed = new Subject<void>();
  /** Expansion model tracks expansion state. */
  expansionModel = new SelectionModel<string>(true);
  /** All used FontAwesome icons in the AppConfigComponent. */
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;
  faTriangleExclamation = faTriangleExclamation;
  /** FormGroup used by the MenuComponent. */
  mainMenuFG = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    action: new FormControl(''),
    enabled: new FormControl('True'),
    visible: new FormControl('True'),
    markdownFile: new FormControl('', this.isActionEnabled()),
    dashboardFile: new FormControl(''),
    mapProject: new FormControl(''),
    url: new FormControl('')
  });
  /***
   * 
   */
  snackBarDuration = 4000;
  /**
   * 
   */
  snackBarHPosition: MatSnackBarHorizontalPosition = 'end';
  /**
   * 
   */
  snackbarVPosition: MatSnackBarVerticalPosition = 'top';
  /** FormGroup used by the SubMenuComponent. */
  subMenuFG = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    action: new FormControl(''),
    enabled: new FormControl('True'),
    doubleSeparatorBefore: new FormControl('False'),
    separatorBefore: new FormControl('False'),
    visible: new FormControl('True'),
    markdownFile: new FormControl(''),  // <-- Conditional required
    dashboardFile: new FormControl(''), // <-- Conditional required
    mapProject: new FormControl(''),    // <-- Conditional required
    url: new FormControl('')            // <-- Conditional required
  });
  /** Controller for the flat tree. */
  treeControl: FlatTreeControl<IM.TreeFlatNode>;
  /** Data source for the flat tree. */
  treeDataSource: MatTreeFlatDataSource<IM.TreeNodeData, IM.TreeFlatNode>;
  /** Tree flattener to convert a normal type of node to node with children & level
   * information. Transforms nested nodes of type T to flattened nodes of type F. */
  treeFlattener: MatTreeFlattener<IM.TreeNodeData, IM.TreeFlatNode>;
  /** Boolean set to false if the URL id for this Build component does not exist
   * in any `app-config.json` mainMenu or subMenu id. */
  validBuildID = true;


  /**
   * 
   * @param actRoute 
   * @param appService 
   * @param breakpointObserver 
   * @param dialog 
   * @param snackBar 
   */
  constructor(private actRoute: ActivatedRoute, private appService: AppService,
  private breakpointObserver: BreakpointObserver, private dialog: MatDialog,
  private snackBar: MatSnackBar) {

    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
    this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<IM.TreeFlatNode>(this.getLevel, this.isExpandable);
    this.treeDataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.buildManager.dataChange.subscribe((data: any) => this.rebuildTreeForData(data));

    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ])
    .pipe(takeUntil(this.destroyed))
    .subscribe((result: any) => {
      for (const query of Object.keys(result.breakpoints)) {
        if (result.breakpoints[query]) {
          this.currentScreenSize = query;
        }
      }
    });
    // Add controls at component creation so it's always performed.
    this.appBuilderForm.addControl('appConfigFG', this.appConfigFG);
    this.appBuilderForm.addControl('datastoreFG', this.datastoreFG);
    this.appBuilderForm.addControl('mainMenuFG', this.mainMenuFG);
    this.appBuilderForm.addControl('subMenuFG', this.subMenuFG);
  }


  /**
   * 
   * @param node 
   * @returns 
   */
  private getChildren = (node: IM.TreeNodeData): Observable<IM.TreeNodeData[]> => of(node.children);

  /**
   * 
   * @param node 
   * @returns 
   */
  private isExpandable = (node: IM.TreeFlatNode) => node.expandable;

   /**
    * 
    * @param node 
    * @returns 
    */
  private getLevel = (node: IM.TreeFlatNode) => node.flatLevel;

  /**
   * 
   * @param _ 
   * @param _nodeData 
   * @returns 
   */
  hasChild = (_: number, _nodeData: IM.TreeFlatNode) => _nodeData.expandable;

  /**
   * 
   * @param node 
   * @param level 
   * @returns 
   */
  transformer = (node: IM.TreeNodeData, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      flatLevel: level,
      name: node.name,
      id: node.id,
      saved: node.saved,
      level: node.level
    } as IM.TreeFlatNode;
  }

  /**
  * Adds a
  */
  addToTree(choice: IM.MenuChoice): void {

    this.buildManager.addNodeToTree(choice, this.expansionModel);
    this.rebuildTreeForData(this.buildManager.treeData);

    // this.treeControl.dataNodes = this.treeNodeData;
    // Save the tree object to the app service for persistence after a user route
    // change.
    this.buildManager.updateBuilderTree(this.buildManager.treeData);

    // if (!this.treeControl.isExpanded(choice.node)) {
    //   this.treeControl.expand(choice.node);
    // }
    // TODO: Maybe remove this?
    this.treeControl.expandAll();
  }

  /**
  * Creates a dialog config object and sets its width & height properties based
  * on the current screen size.
  * @returns An object to be used for creating a dialog with its initial, min, and max
  * height and width conditionally.
  */
  private createDialogConfig(dialogConfigData: any): MatDialogConfig {

    var isMobile = (this.currentScreenSize === Breakpoints.XSmall ||
      this.currentScreenSize === Breakpoints.Small);

    return {
      data: dialogConfigData,
      disableClose: true,
      panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
      height: isMobile ? "100vh" : "850px",
      width: isMobile ? "100vw" : "875px",
      minHeight: isMobile ? "100vh" : "850px",
      minWidth: isMobile ? "100vw" : "875px",
      maxHeight: isMobile ? "100vh" : "850px",
      maxWidth: isMobile ? "100vw" : "875px"
    }
  }

  /**
   * Decides if a tree had been previously made, through user app navigation or
   * by using a cookie if the user navigated completely away from the app. Default
   * is to create a brand new tree.
   */
  determineTreeInit(): void {

    // The user navigated away from the builder inside this application.
    // if (this.buildManager.builtTree.length > 0 && this.buildManager.allSavedNodes['Application']) {
      // this.treeDataSource.data = this.buildManager.builtTree;
      // this.treeNodeData = this.buildManager.builtTree;
      // this.treeControl.dataNodes = this.buildManager.builtTree;
    // }
    // else if (Saved cookie) {

    // }
    // Normal completely new initialization.
    // else {
      // this.initTreeNodeAndFormGroup();
    // }
    this.treeControl.expandAll();
    this.expansionModel.select('0');
  }

  /**
   * Not used but you might need this to programmatically expand nodes
   * to reveal a particular node
   */
  // private expandNodesById(flatNodes: IM.TreeFlatNode[], ids: string[]) {
  //   if (!flatNodes || flatNodes.length === 0) return;
  //   const idSet = new Set(ids);
  //   return flatNodes.forEach((node) => {
  //     if (idSet.has(node.id)) {
  //       this.treeControl.expand(node);
  //       let parent = this.getParentNode(node);
  //       while (parent) {
  //         this.treeControl.expand(parent);
  //         parent = this.getParentNode(parent);
  //       }
  //     }
  //   });
  // }

  /**
   * 
   * @param node 
   * @returns 
   */
  private getParentNode(node: IM.TreeFlatNode): IM.TreeFlatNode | null {
    const currentLevel = node.flatLevel;
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (currentNode.flatLevel < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  // /**
  // * 
  // */
  // initTreeNodeAndFormGroup(): void {
  //   this.treeDataSource.data = this.treeNodeData;
  //   this.treeControl.dataNodes = this.treeNodeData;
  // }

  /**
  * 
  * @returns 
  */
  isActionEnabled(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {

      if (control.parent) {
        if (control.parent.value.action !== '') {
          return Validators.required(control);
        }
      }
      return null;
    }
  }

  /**
   * 
   */
  ngOnInit(): void {

    // When the parameters in the URL are changed the map will refresh and load
    // according to new configuration data.
    this.actRoute.paramMap.pipe(takeUntil(this.destroyed)).subscribe((paramMap: ParamMap) => {

      var buildID = paramMap.get('builderId');
      this.validBuildID = this.appService.validURLConfigID(buildID);

      if (this.validBuildID === false) {
        return;
      }

      this.determineTreeInit();
    });
  }

  /**
   * 
   */
  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
  * 
  */
  openConfigDialog(node: IM.TreeFlatNode): void {

    var dialogConfigData = {
      appBuilderForm: this.appBuilderForm,
      node: node
    }

    var dialogRef: MatDialogRef<DialogComponent, any> = this.dialog.open(
      DialogComponent, this.createDialogConfig(dialogConfigData)
    );

    dialogRef.afterClosed().pipe(first()).subscribe((node: IM.TreeNodeData) => {
      // If the dialog was closed without saving, don't do anything.
      if (!node) {
        return;
      }
      this.updateTreeNodeNameText(node);
      this.saveFormToBuilderJSON(node);

      this.treeControl.expandAll();
    });

  }

  /**
   * Displays the self-closing error message so users know what went wrong.
   */
  openErrorSnackBar() {
    this.snackBar.open('Items can only be moved within the same level.', null, {
      duration: this.snackBarDuration,
      panelClass: 'snackbar-error',
      horizontalPosition: this.snackBarHPosition,
      verticalPosition: this.snackbarVPosition
    })
  }

  /**
  * 
  */
  printFinalBuilderJSON(): void {
    console.log(this.buildManager.fullBuilderJSON);
  }

  publishToAWS(): void {

  }

  /**
   * 
   * @param data 
   */
  rebuildTreeForData(data: any) {
    console.log('Rebuilt treeNodeData:', data);
    this.treeDataSource.data = data;
    this.expansionModel.selected.forEach((id) => {
      const node = this.treeControl.dataNodes.find((n) => n.id === id);
      this.treeControl.expand(node);
    });
  }

  /**
  * Determines what menu choice was selected from a node's kebab menu and calls
  * the necessary function.
  * @param choice 
  */
  receiveMenuChoice(choice: IM.MenuChoice): void {

    switch (choice.choiceType) {
      case 'addDatastore':
      case 'addMainMenu':
      case 'addSubMenu':
        this.addToTree(choice);
        break;
      case 'editConfig':
        this.openConfigDialog(choice.node);
        break;
      case 'deleteConfig':
        this.removeFromTree(choice.node);
    }
  }

  /**
  * 
  * @param node 
  */
  private removeFromTree(node: IM.TreeFlatNode): void {
    console.log('Node to remove:', node);
    // Remove object from the treeNodeData, rebuild, & update.
    this.buildManager.removeNodeFromTree(node);
    this.rebuildTreeForData(this.buildManager.treeData);

    // Save the tree object to the app service for persistence after a user route
    // change.
    this.buildManager.updateBuilderTree(this.buildManager.treeData);
    // Remove from the buildJSON business object.
    this.buildManager.removeFromBuilderJSON(node);
  }

  /**
  * 
  * @param node 
  */
  private saveFormToBuilderJSON(node: IM.TreeNodeData): void {

    if (node.level === 'Application') {
      this.buildManager.saveToBuilderJSON(this.appBuilderForm.getRawValue()['appConfigFG'], node);
    } else if (node.level === 'Datastore') {
      this.buildManager.saveToBuilderJSON(this.appBuilderForm.get('datastoreFG').value, node);
    } else if (node.level === 'Main Menu') {
      this.buildManager.saveToBuilderJSON(this.appBuilderForm.get('mainMenuFG').value, node);
    } else if (node.level === 'SubMenu') {
      this.buildManager.saveToBuilderJSON(this.appBuilderForm.get('subMenuFG').value, node);
    }
  }

  /**
   * Handle the drop - here we rearrange the data based on the drop event,
   * then rebuild the tree.
   * */
  treeNodeDrop(event: CdkDragDrop<string[]>) {
    // console.log('origin/destination', event.previousIndex, event.currentIndex);
  
    // ignore drops outside of the tree
    if (!event.isPointerOverContainer) return;

    // construct a list of visible nodes, this will match the DOM.
    // the cdkDragDrop event.currentIndex jives with visible nodes.
    // it calls rememberExpandedTreeNodes to persist expand state
    const visibleNodes = this.visibleNodes();

    // deep clone the data source so we can mutate it
    const changedData: IM.TreeNodeData[] = JSON.parse(JSON.stringify(this.treeDataSource.data));

    // recursive find function to find siblings of node
    function findNodeSiblings(arr: Array<any>, id: string): Array<any> {
      let result, subResult;
      arr.forEach((item, i) => {
        if (item.id === id) {
          result = arr;
        } else if (item.children) {
          subResult = findNodeSiblings(item.children, id);
          if (subResult) result = subResult;
        }
      });
      return result;

    }

    // determine where to insert the node
    var nodeAtDest: IM.TreeNodeData = visibleNodes[event.currentIndex];
    var newSiblings: IM.TreeNodeData[] = findNodeSiblings(changedData, nodeAtDest.id);
    console.log('newSiblings:', JSON.stringify(newSiblings, null, 4));
    if (!newSiblings) return;
    const insertIndex = newSiblings.findIndex(s => s.id === nodeAtDest.id);

    // Remove the node from its old position.
    const node: IM.TreeFlatNode = event.item.data;
    var siblings = findNodeSiblings(changedData, node.id);
    const siblingIndex = siblings.findIndex(n => n.id === node.id);
    var nodeToInsert: IM.TreeNodeData = siblings.splice(siblingIndex, 1)[0];
    if (nodeAtDest.id === nodeToInsert.id) return;

    // ensure validity of drop - must be same level
    const nodeAtDestFlatNode = this.treeControl.dataNodes.find((n) => nodeAtDest.id === n.id);
    if (nodeAtDestFlatNode.level !== node.level) {
      this.openErrorSnackBar();
      return;
    }

    // Insert node and update all the new indexes for the elements.
    newSiblings.splice(insertIndex, 0, nodeToInsert);
    this.buildManager.updateAllNodeIds(newSiblings);
    console.log('newSiblings:', JSON.stringify(newSiblings, null, 4));
    
    // Rebuild the tree with mutated data.
    this.rebuildTreeForData(changedData);
    // Update the business object.
    this.buildManager.updateBuilderJSON(insertIndex, siblingIndex, nodeToInsert);
  }

  /**
  * 
  * @param node 
  */
  private updateTreeNodeNameText(node: IM.TreeNodeData): void {

    var topDatastoreNode = this.buildManager.treeData[0].children[0];
    var topMainMenuNode = this.buildManager.treeData[0].children[1];
    var nodeIndex = +node.id.charAt(node.id.length - 1);

    if (node.level === 'Application') {
      this.buildManager.treeData[0].name = this.appBuilderForm.get('appConfigFG').value['title'];
      // Since the Application is in the tree by default, the code that updates the
      // Builder Tree won't be run. Update it when the Application level is saved.
      this.buildManager.updateBuilderTree(this.buildManager.treeData);
    } else if (node.level === 'Datastore') {
      topDatastoreNode.children[nodeIndex].name = this.appBuilderForm.get('datastoreFG').value['name'];
    } else if (node.level === 'Main Menu') {
      topMainMenuNode.children[nodeIndex].name = this.appBuilderForm.get('mainMenuFG').value['name'];
    } else if (node.level === 'SubMenu') {
      let parentIndex = +node.id.charAt(node.id.length - 3);
      topMainMenuNode.children[parentIndex].children[nodeIndex].name = this.appBuilderForm.get('subMenuFG').value['name'];
    }

    this.rebuildTreeForData(this.buildManager.treeData);
  }

  /**
   * This constructs an array of nodes that matches the DOM.
   */
  visibleNodes(): IM.TreeNodeData[] {
    const result = [];

    function addExpandedChildren(node: IM.TreeNodeData, expanded: string[]) {
      result.push(node);
      if (expanded.includes(node.id as string)) {
        node.children.map((child) => addExpandedChildren(child, expanded));
      }
    }
    this.treeDataSource.data.forEach((node) => {
      addExpandedChildren(node, this.expansionModel.selected);
    });
    return result;
  }

}

