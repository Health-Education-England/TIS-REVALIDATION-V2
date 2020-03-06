import { NgModule, Optional, SkipSelf, ModuleWithProviders, Inject, InjectionToken, ErrorHandler } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2/gst';
import { AnalyticsErrorHandler } from './analytics.errorhandler';
import { InjectScript } from '../utilities.functions';

export interface AnalyticsConfig {
  siteId: string[];
  enabled: boolean;
}

const AnalyticsConfigValue = new InjectionToken<AnalyticsConfig>(
  "AnalyticsConfig"
);

@NgModule({
  imports: [Angulartics2Module.forRoot()],
  providers: [{ provide: ErrorHandler, useClass: AnalyticsErrorHandler }]
})
export class AnalyticsModule {
  private googleScript: HTMLScriptElement;
  private gaScript: boolean;
  private siteID: string;
  private win: any;

  constructor(
    private angulartics: Angulartics2GoogleGlobalSiteTag,
    @Optional() @SkipSelf() parentModule?: AnalyticsModule,
    @Inject(AnalyticsConfigValue) private analyticsConfig?: AnalyticsConfig,
    @Inject(DOCUMENT) private document?: Document
  ) {
    if (parentModule) {
      throw new Error(
        `AnalyticsModule is already loaded. Import it in the AppModule only`
      );
    }

    if (!analyticsConfig) {
      throw new Error(
        `AnalyticsModule requires forRoot({ siteId: [string array of site id's], enabled: true|false })`
      );
    }

    if (
      this.analyticsConfig &&
      this.analyticsConfig.enabled &&
      this.analyticsConfig.siteId
    ) {
      this.siteID = this.analyticsConfig.siteId.join(",");
      this.win = window as any;
      // TODO: see runOutsideAngularZones
      this.injectGoogleScript();
      this.initializeGtag();
      this.angulartics.startTracking();
    }
  }

  static forRoot(config: AnalyticsConfig): ModuleWithProviders {
    return {
      ngModule: AnalyticsModule,
      providers: [{ provide: AnalyticsConfigValue, useValue: config }]
    };
  }

  /**
   * Global site tag (gtag.js) - Google Analytics
   */
  private injectGoogleScript(): void {
    if (!this.googleScript && typeof this.win.gtag === 'undefined') {
      const googleSrc = `https://www.googletagmanager.com/gtag/js?id=${this.siteID}`;
      this.googleScript = InjectScript(googleSrc, true, this.document);
    }
  }

  /**
   * Initialize window.gtag function for tracking
   */
  private initializeGtag(): void {
    if (!this.gaScript && typeof this.win.gtag === 'undefined') {
      this.gaScript = true;
      this.win.dataLayer = this.win.dataLayer || [];
      this.win.gtag = (...args: any) => { (window as any).dataLayer.push(args); }; // FIX: The 'arguments' object cannot be referenced in an arrow function in ES3 and ES5. Consider using a standard function expression.
      this.win.gtag('js', new Date());
    }
  }
}