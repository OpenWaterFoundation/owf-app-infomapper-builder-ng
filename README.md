# owf-app-infomapper-builder-ng #

Repo description.

# General tips for creating a new Angular application #

This section will offer some guidance to creating a new Angular application.

## Keep the global `@angular/cli` up to date ##

The CLI is what's used to create the new projects, so if @angular/cli version 9.0.3
is installed, then that's the application version that will be installed. This would
immediately need multiple major version updates, which is time consuming and unnecessary
if the globally installed CLI npm package is up to date.

## Create the application with the Angular CLI ##

The command below was run to create this application. The options are as follows:

* `--routing=true` - Generates a routing module for the project. Default is false.
* `--skip-git=true` - Does not initialize a git repository. That will already be
done before the project is created, since the project's top level folder will not
be the repo's top level folder. Default is false.
* `--style=scss` - The file extension or preprocessor to use for style files. Default
is css.

`ng new infomapper-builder --routing=true --skip-git=true --style=scss`

## Troubleshooting ##

This section details an errors or other hang ups in project creation, and should
act as a guide for resolving these issues in the future.

### Component decorator is showing an error ###

If the version of TypeScript that VSCode is using is less than the installed version
in the Angular project, this error will display. An update and restart of VSCode
resolved this issue, and checking the TypeScript before and after the update confirmed
this.

### Angular Material core theme ###

When using Angular Material, a theme must be defined. Add the desired theme's path
to its CSS file in the project's `angular.json` styles array. If using a pre-built
theme, it will be in the `@angular/material/prebuilt-themes` folder in node_modules.