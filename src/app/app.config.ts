import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';
import {
  FingerprintjsProAngularModule,
} from '@fingerprintjs/fingerprintjs-pro-angular';
import { Region } from '@fingerprintjs/fingerprintjs-pro';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(
      FingerprintjsProAngularModule.forRoot({
        loadOptions: {
          apiKey: environment.fpApiKey,
          region: environment.fpRegion as Region,
        }
      }),
    )
  ],
};
