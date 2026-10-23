import { Routes } from "@angular/router";
import { canActivateGuard } from "@ditic/modelo-ui-lib";

/**
 * Configuração de rotas para o módulo de Palavras
 *
 * Define as rotas disponíveis para navegação dentro do contexto de palavras,
 * bem como as permissões necessárias para acessar cada rota.
 *
 * @remarks
 * Utiliza o guard canActivateGuard da biblioteca modelo-ui-lib para proteger
 * as rotas com base nas roles do usuário autenticado via Keycloak.
 */
export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./palavra.component").then((m) => m.PalavraComponent),
    canActivate: [canActivateGuard], // só acessa a rota se usuário autenticado, caso seja uma rota sem autenticação, retire o canActivate
    data: { roles: ["membros"] }, // role a ser testada pelo serviço de autenticação
  },
  {
    path: "add",
    loadComponent: () => import("./add/add.component").then((m) => m.AddComponent),
    canActivate: [canActivateGuard], // só acessa a rota se usuário autenticado, caso seja uma rota sem autenticação, retire o canActivate
    data: { roles: ["administrador"] }, // role a ser testada pelo serviço de autenticação
  },
  {
    path: "update/:id",
    loadComponent: () => import("./update/update.component").then((m) => m.UpdateComponent),
    canActivate: [canActivateGuard], // só acessa a rota se usuário autenticado, caso seja uma rota sem autenticação, retire o canActivate
    data: { roles: ["membros"] }, // role a ser testada pelo serviço de autenticação
  },
];
