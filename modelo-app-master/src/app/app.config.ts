import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection } from "@angular/core";
import { provideRouter, withComponentInputBinding, withViewTransitions } from "@angular/router";
import { TJRSAngularMaterialModule, TJRSModule, TJRSModuleConfig, provideEnvironmentTjrs, provideKeycloak } from "@ditic/modelo-ui-lib";
import { environment } from "../environments/environment";
import { routes } from "./app.routes";

export const tjrsConfig: TJRSModuleConfig = {
  apiUrl: environment.apiUrl,
  httpInterceptorInjectToken: true,
  httpInterceptorShowErrorMessage: true,
  apm: environment.apm,
  keycloak: environment.keycloak,
  /**
   * Ativa o loading automático para requisições HTTP
   */
  loadingInterceptorShowHttpLoading: true,
  /**
   * Ativa o loading automático para navegação entre rotas
   */
  loadingInterceptorShowRouterLoading: true,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideEnvironmentTjrs(tjrsConfig),
    importProvidersFrom(TJRSModule, TJRSAngularMaterialModule),
    provideKeycloak(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptorsFromDi()),
  ],
};
