import { Component,
          OnDestroy,
          OnInit }                 from '@angular/core';
import { AbstractControl,
          FormControl,
          FormGroup,
          ValidationErrors,
          ValidatorFn,
          Validators }             from '@angular/forms';
import { ActivatedRoute,
          ParamMap }               from '@angular/router';
import { MatDialog,
          MatDialogConfig,
          MatDialogRef }           from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { BreakpointObserver,
          Breakpoints }            from '@angular/cdk/layout';
import { NestedTreeControl }       from '@angular/cdk/tree';

import { faChevronDown,
          faChevronRight,
          faTriangleExclamation }  from '@fortawesome/free-solid-svg-icons';

import { first,
          Observable,
          Subject,
          takeUntil }              from 'rxjs';

import { CommonLoggerService }     from '@OpenWaterFoundation/common/services';
import * as IM                     from '@OpenWaterFoundation/common/services';

import { AppService }              from '../app.service';
import { DialogComponent }         from './builder-utility/dialog/dialog.component';
import { BuildManager }            from './build-manager';


@Component({
  selector: 'app-build',
  templateUrl: './build.component.html',
  styleUrls: ['./build.component.scss']
})
export class BuildComponent implements OnInit, OnDestroy {

  /** The main FormGroup for the entire application. */
  appBuilderForm = new FormGroup({});
  /** FormGroup used by the AppConfigComponent. */
  appConfigFG = new FormGroup({
    title: new FormControl('', Validators.required),
    homePage: new FormControl({ value: '/content-page/home.md', disabled: true}),
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
  /** Structure for nested Trees. */
  treeControl = new NestedTreeControl<IM.TreeNodeData>(node => node.children);
  /** The dataSource object that is used to display and update the tree on the DOM. */
  treeDataSource = new MatTreeNestedDataSource<IM.TreeNodeData>();
  /** Initial data for a new tree. */
  treeNodeData: IM.TreeNodeData[] = [
    {
      level: 'Application',
      name: 'New application',
      index: 0,
      children: [
        {
          level: 'Datastores',
          name: 'Datastores',
          index: 0,
          children: []
        },
        {
          level: 'Main Menus',
          name: 'Main Menus',
          index: 1,
          children: []
        }
      ]
    }
  ];
  /** Boolean set to false if the URL id for this Build component does not exist
   * in any `app-config.json` mainMenu or subMenu id. */
  validBuildID = true;


  /**
   * Constructor for the BuildComponent.
   * @param logger OWF Common library for logging.
   * @param actRoute Provides access to information about the current route/URL.
   * @param appService The InfoMapper Builder's top level service.
   */
  constructor(private breakpointObserver: BreakpointObserver, private logger: CommonLoggerService,
  private actRoute: ActivatedRoute, private appService: AppService,
  private dialog: MatDialog) {

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
   * Adds a
   */
  addToTree(choice: IM.MenuChoice): void {

    this.buildManager.addNodeToTree(this.treeNodeData[0], choice);
    // This is required for Angular to see the changes and update the Tree.
    // https://stackoverflow.com/questions/50976766/how-to-update-nested-mat-tree-dynamically
    this.treeDataSource.data = null;
    this.treeDataSource.data = this.treeNodeData;
    this.treeControl.dataNodes = this.treeNodeData;
    // Save the tree object to the app service for persistence after a user route
    // change.
    this.buildManager.updateBuilderTree(this.treeNodeData);

    if (!this.treeControl.isExpanded(choice.node)) {
      this.treeControl.expand(choice.node);
    }
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
    if (this.buildManager.builtTree.length > 0 && this.buildManager.allSavedNodes['Application']) {
      this.treeDataSource.data = this.buildManager.builtTree;
      this.treeNodeData = this.buildManager.builtTree;
      this.treeControl.dataNodes = this.buildManager.builtTree;
    }
    // else if (Saved cookie) {

    // }
    // Normal completely new initialization.
    else {
      this.initTreeNodeAndFormGroup();
    }

    this.treeControl.expandAll();
  }
  
  /**
   * 
   */
  hasChild = (_: number, node: any) => !!node.children && node.children.length > 0;

  /**
   * 
   */
  initTreeNodeAndFormGroup(): void {
    this.treeDataSource.data = this.treeNodeData;
    this.treeControl.dataNodes = this.treeNodeData;
  }

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

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
  * 
  */
   public openConfigDialog(node: IM.TreeNodeData): void {

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
      this.saveFormToFinalBuilderJSON(node);
    });

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
   * Determines what menu choice was selected from a node's kebab menu and calls
   * the necessary function.
   * @param choice 
   */
  receiveMenuChoice(choice: IM.MenuChoice): void {

    switch(choice.choiceType) {
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
  private removeFromTree(node: IM.TreeNodeData): void {
    this.buildManager.removeNodeFromTree(this.treeNodeData[0], node);

    this.treeDataSource.data = null;
    this.treeDataSource.data = this.treeNodeData;
    this.treeControl.dataNodes = this.treeNodeData;
    // Save the tree object to the app service for persistence after a user route
    // change.
    this.buildManager.updateBuilderTree(this.treeNodeData);
    this.buildManager.removeFromBuilderJSON(node);
  }

  /**
   * 
   * @param node 
   */
  private saveFormToFinalBuilderJSON(node: IM.TreeNodeData): void {

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
   * 
   * @param node 
   */
  private updateTreeNodeNameText(node: IM.TreeNodeData): void {

    var topDatastoreNode = this.treeNodeData[0].children[0];
    var topMainMenuNode = this.treeNodeData[0].children[1];

    if (node.level === 'Application') {
      this.treeNodeData[0].name = this.appBuilderForm.get('appConfigFG').value['title'];
      // Since the Application is in the tree by default, the code that updates the
      // Builder Tree won't be run. Update it when the Application level is saved.
      this.buildManager.updateBuilderTree(this.treeNodeData);
    } else if (node.level === 'Datastore') {
      topDatastoreNode.children[node.index].name = this.appBuilderForm.get('datastoreFG').value['name'];
    } else if (node.level === 'Main Menu') {
      topMainMenuNode.children[node.index].name = this.appBuilderForm.get('mainMenuFG').value['name'];
    } else if (node.level === 'SubMenu') {
      topMainMenuNode.children[node.parentIndex].children[node.index].name = this.appBuilderForm.get('subMenuFG').value['name'];
    }
  }

  /**
   * 
   */
  validNodeSaveState(node: IM.TreeNodeData): Observable<boolean> {
    return this.buildManager.isNodeInSavedState(node);
  }

}
