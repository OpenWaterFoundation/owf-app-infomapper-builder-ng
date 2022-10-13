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

## Using the AWS SDK ##

Amazon has created the third version of its [AWS JavaScript SDK](https://github.com/aws/aws-sdk-js-v3),
which can be imported using the npm scope `@aws-sdk/some-package`. This version
is more modular in that only the packages being used can be imported from the
`@aws-sdk` scope. More information can be found in the
[SDK welcome page](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html)
and the
[official documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html).

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

### Importing module from Angular library shows long errors ##

When importing a module from an Angular library, a very long error is shown that
look something like the following:

```
../../../../AngularDev/git-repos/owf-app-dev-ng/ng-workspace/node_modules/@angular/material/fesm2020/menu.mjs:60:13-27 - Error: export '??resetView' (imported as 'i0') was not found in '@angular/core' (possible exports: ANALYZE_FOR_ENTRY_COMPONENTS, APP_BOOTSTRAP_LISTENER, APP_ID, APP_INITIALIZER, ApplicationInitStatus, ApplicationModule, ApplicationRef, Attribute, COMPILER_OPTIONS, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, ChangeDetectorRef, Compiler, CompilerFactory, Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, ContentChild, ContentChildren, DEFAULT_CURRENCY_CODE, DebugElement, DebugEventListener, DebugNode, DefaultIterableDiffer, Directive, ElementRef, EmbeddedViewRef, ErrorHandler, EventEmitter, Host, HostBinding, HostListener, INJECTOR, Inject, InjectFlags, Injectable, InjectionToken, Injector, Input, IterableDiffers, KeyValueDiffers, LOCALE_ID, MissingTranslationStrategy, ModuleWithComponentFactories, NO_ERRORS_SCHEMA, NgModule, NgModuleFactory, NgModuleRef, NgProbeToken, NgZone, Optional, Output, PACKAGE_ROOT_URL, PLATFORM_ID, PLATFORM_INITIALIZER, Pipe, PlatformRef, Query, QueryList, ReflectiveInjector, ReflectiveKey, Renderer2, RendererFactory2, RendererStyleFlags2, ResolvedReflectiveFactory, Sanitizer, SecurityContext, Self, SimpleChange, SkipSelf, TRANSLATIONS, TRANSLATIONS_FORMAT, TemplateRef, Testability, TestabilityRegistry, Type, VERSION, Version, ViewChild, ViewChildren, ViewContainerRef, ViewEncapsulation, ViewRef, asNativeElements, assertPlatform, createNgModuleRef, createPlatform, createPlatformFactory, defineInjectable, destroyPlatform, enableProdMode, forwardRef, getDebugNode, getModuleFactory, getNgModuleById, getPlatform, inject, isDevMode, platformCore, resolveForwardRef, setTestabilityGetter, ?ALLOW_MULTIPLE_PLATFORMS, ?APP_ID_RANDOM_PROVIDER, ?ChangeDetectorStatus, ?ComponentFactory, ?Console, ?DEFAULT_LOCALE_ID, ?INJECTOR_SCOPE, ?LifecycleHooksFeature, ?LocaleDataIndex, ?NG_COMP_DEF, ?NG_DIR_DEF, ?NG_ELEMENT_ID, ?NG_INJ_DEF, ?NG_MOD_DEF, ?NG_PIPE_DEF, ?NG_PROV_DEF, ?NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR, ?NO_CHANGE, ?NgModuleFactory, ?NoopNgZone, ?ReflectionCapabilities, ?Render3ComponentFactory, ?Render3ComponentRef, ?Render3NgModuleRef, ?RuntimeError, ?ViewRef, ?_sanitizeHtml, ?_sanitizeUrl, ?allowSanitizationBypassAndThrow, ?bypassSanitizationTrustHtml, ?bypassSanitizationTrustResourceUrl, ?bypassSanitizationTrustScript, ?bypassSanitizationTrustStyle, ?bypassSanitizationTrustUrl, ?clearResolutionOfComponentResourcesQueue, ?compileComponent, ?compileDirective, ?compileNgModule, ?compileNgModuleDefs, ?compileNgModuleFactory, ?compilePipe, ?createInjector, ?defaultIterableDiffers, ?defaultKeyValueDiffers, ?detectChanges, ?devModeEqual, ?findLocaleData, ?flushModuleScopingQueueAsMuchAsPossible, ?getDebugNode, ?getDebugNodeR2, ?getDirectives, ?getHostElement, ?getInjectableDef, ?getLContext, ?getLocaleCurrencyCode, ?getLocalePluralCase, ?getSanitizationBypassType, ?global, ?injectChangeDetectorRef, ?isBoundToModule, ?isDefaultChangeDetectionStrategy, ?isListLikeIterable, ?isObservable, ?isPromise, ?isSubscribable, ?ivyEnabled, ?makeDecorator, ?markDirty, ?noSideEffects, ?patchComponentDefWithScope, ?publishDefaultGlobalUtils, ?publishGlobalUtil, ?registerLocaleData, ?registerNgModuleType, ?renderComponent, ?resetCompiledComponents, ?resetJitOptions, ?resolveComponentResources, ?setClassMetadata, ?setCurrentInjector, ?setDocument, ?setLocaleId, ?store, ?stringify, ?transitiveScopesFor, ?unregisterLocaleData, ?unwrapSafeValue, ?whenRendered, ??CopyDefinitionFeature, ??FactoryTarget, ??InheritDefinitionFeature, ??NgOnChangesFeature, ??ProvidersFeature, ??advance, ??attribute, ??attributeInterpolate1, ??attributeInterpolate2, ??attributeInterpolate3, ??attributeInterpolate4, ??attributeInterpolate5, ??attributeInterpolate6, ??attributeInterpolate7, ??attributeInterpolate8, ??attributeInterpolateV, ??classMap, ??classMapInterpolate1, ??classMapInterpolate2, ??classMapInterpolate3, ??classMapInterpolate4, ??classMapInterpolate5, ??classMapInterpolate6, ??classMapInterpolate7, ??classMapInterpolate8, ??classMapInterpolateV, ??classProp, ??contentQuery, ??defineComponent, ??defineDirective, ??defineInjectable, ??defineInjector, ??defineNgModule, ??definePipe, ??directiveInject, ??disableBindings, ??element, ??elementContainer, ??elementContainerEnd, ??elementContainerStart, ??elementEnd, ??elementStart, ??enableBindings, ??getCurrentView, ??getInheritedFactory, ??hostProperty, ??i18n, ??i18nApply, ??i18nAttributes, ??i18nEnd, ??i18nExp, ??i18nPostprocess, ??i18nStart, ??inject, ??injectAttribute, ??invalidFactory, ??invalidFactoryDep, ??listener, ??loadQuery, ??namespaceHTML, ??namespaceMathML, ??namespaceSVG, ??nextContext, ??ngDeclareClassMetadata, ??ngDeclareComponent, ??ngDeclareDirective, ??ngDeclareFactory, ??ngDeclareInjectable, ??ngDeclareInjector, ??ngDeclareNgModule, ??ngDeclarePipe, ??pipe, ??pipeBind1, ??pipeBind2, ??pipeBind3, ??pipeBind4, ??pipeBindV, ??projection, ??projectionDef, ??property, ??propertyInterpolate, ??propertyInterpolate1, ??propertyInterpolate2, ??propertyInterpolate3, ??propertyInterpolate4, ??propertyInterpolate5, ??propertyInterpolate6, ??propertyInterpolate7, ??propertyInterpolate8, ??propertyInterpolateV, ??pureFunction0, ??pureFunction1, ??pureFunction2, ??pureFunction3, ??pureFunction4, ??pureFunction5, ??pureFunction6, ??pureFunction7, ??pureFunction8, ??pureFunctionV, ??queryRefresh, ??reference, ??resolveBody, ??resolveDocument, ??resolveWindow, ??restoreView, ??sanitizeHtml, ??sanitizeResourceUrl, ??sanitizeScript, ??sanitizeStyle, ??sanitizeUrl, ??sanitizeUrlOrResourceUrl, ??setComponentScope, ??setNgModuleScope, ??styleMap, ??styleMapInterpolate1, ??styleMapInterpolate2, ??styleMapInterpolate3, ??styleMapInterpolate4, ??styleMapInterpolate5, ??styleMapInterpolate6, ??styleMapInterpolate7, ??styleMapInterpolate8, ??styleMapInterpolateV, ??styleProp, ??stylePropInterpolate1, ??stylePropInterpolate2, ??stylePropInterpolate3, ??stylePropInterpolate4, ??stylePropInterpolate5, ??stylePropInterpolate6, ??stylePropInterpolate7, ??stylePropInterpolate8, ??stylePropInterpolateV, ??syntheticHostListener, ??syntheticHostProperty, ??template, ??templateRefExtractor, ??text, ??textInterpolate, ??textInterpolate1, ??textInterpolate2, ??textInterpolate3, ??textInterpolate4, ??textInterpolate5, ??textInterpolate6, ??textInterpolate7, ??textInterpolate8, ??textInterpolateV, ??trustConstantHtml, ??trustConstantResourceUrl, ??viewQuery)
```

This is because the version of the Angular application and library are not the same.
According to the developers, they try to make it so an application up to 2 major
versions ahead of the library will still work, but that is not guaranteed. A safer
and more robust solution would be to just make sure they are both as caught up as
possible to the LTS version. Updating both to the same major version removed these
errors.

### App recompile shows NG0301 error ###

Sometimes an application refresh shows an ambiguous Angular error that just shows
`Error: NG0301` and nothing else. Google searches tend to think it's a template
file parsing error, or other errors that is the same NG error, but includes more
descriptive text. The effected area of the page will either not render, or not correctly
render the code on the page.

A consistent solution has been to make sure the area in the DOM is template code
from a specific component. It has been every time this error has occurred. Navigate
to the `.ts` file of said component and make a trivial change to it. After a save
and recompile, the component should be rendered correctly (or as the created).

This seems to be an issue where web pack, or something else, 'forgets' about the
component's existence in the application. Making a change to the component's
TypeScript file helps it remember again.