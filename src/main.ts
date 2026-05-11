import { bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode, isDevMode } from '@angular/core';
import { appConfig } from './app/app.config';
import { App } from './app/app';

if (!isDevMode()) {
  enableProdMode();
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
