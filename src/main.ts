import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from '../src/environment/environment';

if (environment.production) {
  enableProdMode();
}

console.log('Bootstrapping Angular application...'); // Debug log

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error('Bootstrap failed:', err)); 
