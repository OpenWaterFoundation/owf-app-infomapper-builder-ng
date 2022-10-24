import { Component,
          Input,
          OnInit }      from '@angular/core';

import { faBookOpen,
          faFileLines,
          faGaugeHigh } from '@fortawesome/free-solid-svg-icons';

import * as IM from '@OpenWaterFoundation/common/services';

@Component({
  selector: 'nav-bar-menu',
  templateUrl: './nav-bar-menu.component.html',
  styleUrls: ['./nav-bar-menu.component.scss']
})
export class NavBarMenuComponent implements OnInit {

  /** All used FontAwesome icons in the NavBarMenuComponent. */
  faBookOpen = faBookOpen
  faFileLines = faFileLines;
  faGaugeHigh = faGaugeHigh;
  /** The InfoMapper MainMenu object to be used for creating each SubMenu and displaying
   * on the site. */
  @Input() mainMenu: IM.MainMenu;
  

  /**
   * Constructor for the NavBarMenuComponent.
   */
  constructor() { }


  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
   */
  ngOnInit(): void {
    this.cleanProperties();
  }

  /**
   * Converts all enabled, visible, and separatorBefore properties to booleans for easier HTML creation
   * for this component's template file.
   */
   private cleanProperties(): void {
    // Convert enabled to boolean.
    if (this.mainMenu.enabled) {
      switch (typeof this.mainMenu.enabled) {
        case 'string': this.mainMenu.enabled = (this.mainMenu.enabled.toUpperCase() === 'TRUE');
        break;
      }
    }
    // Convert every sub menu's enabled, visible, and separatorBefore properties to a boolean
    if (this.mainMenu.menus) {
      for (let subMenu of this.mainMenu.menus) {
        switch (typeof subMenu.enabled) {
          case 'string': subMenu.enabled = (subMenu.enabled.toUpperCase() === 'TRUE'); break;
        }
        switch (typeof subMenu.separatorBefore) {
          case 'string': subMenu.separatorBefore = (subMenu.separatorBefore.toUpperCase() === 'TRUE'); break;
        }
        switch (typeof subMenu.doubleSeparatorBefore) {
          case 'string': subMenu.doubleSeparatorBefore = (subMenu.doubleSeparatorBefore.toUpperCase() === 'TRUE'); break;
        }
        switch (typeof subMenu.visible) {
          case 'string': subMenu.visible = (subMenu.visible.toUpperCase() === 'TRUE'); break;
        }
      }      
    }
  }

}
