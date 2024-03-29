import { Component,
          OnDestroy,
          OnInit }                      from '@angular/core';
import { FormControl,
          FormGroup,
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

import { AppService }                   from '../services/app.service';
import { BreakpointObserverService }    from '../services/breakpoint-observer.service';
import { BrowseDialogComponent }        from './builder-utility/dialog/browse-dialog/browse-dialog.component';
import { ConfigDialogComponent }        from './builder-utility/dialog/config-dialog/config-dialog.component';
import { BuildManager }                 from '../build/build-manager';


@Component({
  selector: 'app-build',
  templateUrl: './build.component.html',
  styleUrls: ['./build.component.scss']
})
export class BuildComponent implements OnInit, OnDestroy {

  /** The main FormGroup for the all Build forms. */
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
    markdownFile: new FormControl(''),
    dashboardFile: new FormControl(''),
    mapProject: new FormControl(''),
    storyFile: new FormControl(''),
    url: new FormControl(''),
    enabled: new FormControl('True'),
    visible: new FormControl('True'),
  });
  /** How many milliseconds the error snackbar will be displayed for. */
  snackBarDuration = 3000;
  /** Sets the horizontal position of the error snackbar to display on the right
   * side of the screen. */
  snackBarHPosition: MatSnackBarHorizontalPosition = 'center';
  /** Sets the vertical position of the error snackbar to display at the top of
  * the screen. */
  snackbarVPosition: MatSnackBarVerticalPosition = 'top';
  /** FormGroup used by the SubMenuComponent. */
  subMenuFG = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    action: new FormControl(''),
    markdownFile: new FormControl(''),
    dashboardFile: new FormControl(''),
    mapProject: new FormControl(''),
    storyFile: new FormControl(''),
    url: new FormControl(''),
    enabled: new FormControl('True'),
    doubleSeparatorBefore: new FormControl('False'),
    separatorBefore: new FormControl('False'),
    tooltip: new FormControl(''),
    visible: new FormControl('True')
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
  * @param dialog 
  * @param screenSizeService
  * @param snackBar 
  */
  constructor(private actRoute: ActivatedRoute, private appService: AppService,
  private dialog: MatDialog, private logger: IM.CommonLoggerService,
  private screenSizeService: BreakpointObserverService, private snackBar: MatSnackBar) {

    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<IM.TreeFlatNode>(this.getLevel, this.isExpandable);
    this.treeDataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.buildManager.dataChange.pipe(takeUntil(this.destroyed))
    .subscribe((data: any) => this.rebuildTreeForData(data));

    // Add controls at component creation so it's always performed.
    this.appBuilderForm.addControl('appConfigFG', this.appConfigFG);
    this.appBuilderForm.addControl('datastoreFG', this.datastoreFG);
    this.appBuilderForm.addControl('mainMenuFG', this.mainMenuFG);
    this.appBuilderForm.addControl('subMenuFG', this.subMenuFG);
  }


  /**
  * Adds a new node to the flat tree, rebuilds the tree so it can be rerendered,
  * updates the tree used for persistence, and expands the current node if needed.
  */
  addToTree(choice: IM.MenuChoice): void {

    this.buildManager.addNodeToTree(choice, this.expansionModel);
    this.rebuildTreeForData(this.buildManager.treeData);

    // Save the tree object to the app service for persistence after a user route
    // change.
    this.buildManager.updateBuilderTree(this.buildManager.treeData);

    if (!this.treeControl.isExpanded(choice.node)) {
      this.treeControl.expand(choice.node);
    }
  }

  /**
   * Open up and display the files accessible to this user from an AWS bucket.
   */
  browseS3Files(): void {
    const dialogData = {
      type: 'content'
    }

    var fileExplorerDialogRef: MatDialogRef<BrowseDialogComponent, any> = this.dialog.open(
      BrowseDialogComponent, this.createDialogConfig(dialogData)
    );

    // To run when the opened dialog is closed.
    fileExplorerDialogRef.afterClosed().pipe(first()).subscribe((fileSourcePath: string) => {
      if (fileSourcePath) {
        // Change param to `results`.
        this.openBuiltConfigFromFile(fileSourcePath);
      }
    });
  }

  /**
  * Creates a dialog config object and sets its width & height properties based
  * on the current screen size.
  * @returns An object to be used for creating a dialog with its initial, min, and max
  * height and width conditionally.
  */
  private createDialogConfig(dialogData?: any): MatDialogConfig {

    var isMobile = this.screenSizeService.isMobile;

    return {
      data: dialogData ? dialogData : null,
      disableClose: true,
      panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
      height: isMobile ? "100vh" : "850px",
      width: isMobile ? "100vw" : "875px",
      minHeight: isMobile ? "100vh" : "20vw",
      minWidth: isMobile ? "100vw" : "875px",
      maxHeight: isMobile ? "100vh" : "95vh",
      maxWidth: isMobile ? "100vw" : "70vw"
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
  private getLevel = (node: IM.TreeFlatNode) => node.flatLevel;

  /**
  * 
  * @param _ 
  * @param _nodeData 
  * @returns 
  */
  hasChild = (_: number, _nodeData: IM.TreeFlatNode) => _nodeData.expandable;

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
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
      this.logger.print('info', 'Build initialization.');
      this.determineTreeInit();
    });
  }

  /**
  * 
  * @param node 
  * @returns 
  */
  private isExpandable = (node: IM.TreeFlatNode) => node.expandable;

  /**
  * Called once right before this component is destroyed.
  */
  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
  * Creates and opens an Angular Material dialog to show the passed in node's configuration
  * form. Subscribes to dialog closure to handle the saved form and update necessary
  * properties in the app.
  */
  openConfigDialog(node: IM.TreeFlatNode): void {

    var dialogConfigData = {
      appBuilderForm: this.appBuilderForm,
      node: node
    }

    var dialogRef: MatDialogRef<ConfigDialogComponent, any> = this.dialog.open(
      ConfigDialogComponent, this.createDialogConfig(dialogConfigData)
    );

    // To run when the opened dialog is closed.
    dialogRef.afterClosed().pipe(first()).subscribe((node: IM.TreeFlatNode) => {
      // If the dialog was closed without saving, don't do anything.
      if (!node) {
        return;
      }
      this.updateTreeNodeNameText(node);
      this.saveFormToBuilderJSON(node);

      if (!this.treeControl.isExpanded(node)) {
        this.treeControl.expand(node);
      }
    });
  }

  /**
   * 
   * @param sourcePath 
   */
  openBuiltConfigFromFile(sourcePath: string): void {

    this.appService.getJSONData(sourcePath).pipe(first()).subscribe((appConfig: IM.AppConfig) => {
      console.log('App config file contents from S3:', appConfig);
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
    });
  }

  /**
   * 
   */
  publishToAWS(): void {

  }

  /**
  * 
  * @param data 
  */
  rebuildTreeForData(data: any) {
    this.treeDataSource.data = data;
    this.expansionModel.selected.forEach((id) => {
      const node = this.treeControl.dataNodes.find((n) => n.id === id);
      this.treeControl.expand(node);
    });
  }

  /**
  * Determines what menu choice was selected from a node's kebab menu and calls
  * the necessary function.
  * @param choice Object that holds properties for (1) what choice was chosen from
  * the tree node menu, and (2) the TreeFlatNode object.
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
      case 'removeNode':
        this.removeFromTree(choice.node);
    }
  }

  /**
  * 
  * @param node 
  */
  private removeFromTree(node: IM.TreeFlatNode): void {

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
  * Determines which FormGroup to save to the builderJSON business object, and
  * rebuilds the tree when it's finished.
  * @param node The current tree node.
  */
  private saveFormToBuilderJSON(node: IM.TreeFlatNode): void {

    if (node.level === 'Application') {
      this.buildManager.saveToBuilderJSON(this.appBuilderForm.getRawValue()['appConfigFG'], node);
    } else if (node.level === 'Datastore') {
      this.buildManager.saveToBuilderJSON(this.appBuilderForm.get('datastoreFG').value, node);
    } else if (node.level === 'Main Menu') {
      this.buildManager.saveToBuilderJSON(this.appBuilderForm.get('mainMenuFG').value, node);
    } else if (node.level === 'SubMenu') {
      this.buildManager.saveToBuilderJSON(this.appBuilderForm.get('subMenuFG').value, node);
    }

    this.rebuildTreeForData(this.buildManager.treeData);
  }

  /**
  * Saves the current business object to the Python Flask back-end which will
  * save the data to a local file.
  */
  saveToLocalFile(): void {
    this.appService.postData(this.buildManager.fullBuilderJSON);
  }

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
  * Handle the drop. The data is rearranged based on the drop event, then rebuild
  * the tree after. The treeData from the buildManager is directly used so it can
  * be updated and used elsewhere.
  */
  treeNodeDrop(event: CdkDragDrop<string[]>) {

    // Ignore drops outside of the tree.
    if (!event.isPointerOverContainer) return;

    // construct a list of visible nodes, this will match the DOM.
    // the cdkDragDrop event.currentIndex jives with visible nodes.
    // it calls rememberExpandedTreeNodes to persist expand state.
    const visibleNodes = this.visibleNodes();

    // Recursive find function to find siblings of node.
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

    // Determine where to insert the node.
    var nodeAtDest: IM.TreeNodeData = visibleNodes[event.currentIndex];
    var newSiblings: IM.TreeNodeData[] = findNodeSiblings(this.buildManager.treeData, nodeAtDest.id);
    if (!newSiblings) return;
    const insertIndex = newSiblings.findIndex(s => s.id === nodeAtDest.id);

    // Ensure validity of drop - must be same level. This is checked before removing
    // the node since the data object directly used as the data source is manipulated.
    const node: IM.TreeFlatNode = event.item.data;
    const nodeAtDestFlatNode = this.treeControl.dataNodes.find((n) => nodeAtDest.id === n.id);
    if (nodeAtDestFlatNode.level !== node.level) {
      this.openErrorSnackBar();
      return;
    }

    // Remove the node from its old position.
    var siblings = findNodeSiblings(this.buildManager.treeData, node.id);
    const siblingIndex = siblings.findIndex(n => n.id === node.id);
    var nodeToInsert: IM.TreeNodeData = siblings.splice(siblingIndex, 1)[0];
    if (nodeAtDest.id === nodeToInsert.id) return;

    // Insert node and update all the new indexes for the elements.
    newSiblings.splice(insertIndex, 0, nodeToInsert);
    this.buildManager.updateAllNodeIds(newSiblings);

    // Rebuild the tree with updated treeData.
    this.rebuildTreeForData(this.buildManager.treeData);
    // Update the business object.
    this.buildManager.updateBuilderJSON(insertIndex, siblingIndex, nodeToInsert);
  }

  /**
  * 
  * @param node 
  */
  private updateTreeNodeNameText(node: IM.TreeFlatNode): void {

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

