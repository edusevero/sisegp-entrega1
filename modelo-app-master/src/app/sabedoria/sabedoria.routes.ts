import { Routes } from "@angular/router";
import { canActivateGuard } from "@ditic/modelo-ui-lib";

/**
 * Configuração de rotas para o módulo de Sabedoria
 *
 * Define as rotas disponíveis para navegação dentro do contexto de sabedoria,
 * bem como as permissões necessárias para acessar cada rota.
 *
 * @remarks
 * Utiliza o guard canActivateGuard da biblioteca modelo-ui-lib para proteger
 * as rotas com base nas roles do usuário autenticado via Keycloak.
 */
export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./sabedoria.component").then((m) => m.SabedoriaComponent),
    canActivate: [canActivateGuard], // só acessa a rota se usuário autenticado, caso seja uma rota sem autenticação, retire o canActivate
    data: { roles: ["membros"] }, // role a ser testada pelo serviço de autenticação
  },
];
