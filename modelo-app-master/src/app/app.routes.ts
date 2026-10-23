import { Routes } from "@angular/router";
import { tjrsLoginPageRoute, TJRSPageNotFoundComponent } from "@ditic/modelo-ui-lib";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "home" },
  { path: "home", loadChildren: () => import("./home/home.routes").then((mod) => mod.routes) },
  { path: "palavra", loadChildren: () => import("./palavra/palavra.routes").then((mod) => mod.routes) },
  { path: "sabedoria", loadChildren: () => import("./sabedoria/sabedoria.routes").then((mod) => mod.routes) },

  // Demonstra o uso do componente diretamente na rota: as informacoes do 'data' são
  // vinculados aos inputs via withComponentInputBinding() (ver app.config.ts).
  tjrsLoginPageRoute({
    path: "login",
    title: "Portal do Modelo Front-end",
    content: `
      <p>O componente <code>TJRSLoginPageComponent</code> serve para dar ao usuário as opções de acesso.</p>
      <p>É configurado para mostrar as opções de acesso "Interno" (EntraID) e "Externo" (gov.br).</p>
      <p>O componente pode ser utilizado diretamente na rota, e as informações de 'data' são vinculadas aos inputs do componente via withComponentInputBinding() (ver app.config.ts), ou pode ser utilizado em outros contextos, como um componente customizado de sua aplicação.</p>

      <p>Algumas informações do componente podem ser customizadas, como:</p>
      <ul>
        <li><code>title</code>: O título exibido acima das opções de acesso.</li>
        <li><code>content</code>: O conteúdo HTML exibido abaixo do título, onde é possível incluir descrições ou instruções adicionais para os usuários.</li>
        <li>Labels e logos dos botões (<code>internalLogo</code>/<code>externalLogo</code>: <code>"tjrs"</code>, <code>"govbr"</code> ou caminho custom) e a imagem de fundo também podem ser customizados.</li>
      </ul>

      <p>Para mais detalhes sobre o componente, consulte a <a href="https://gitlab.tjrs.jus.br/ditic/assesgov/arqsis/modelo4/modelo-ui/-/wikis/Components#110-tjrsloginpagecomponent--component" target="_blank">documentação</a>.</p>
      `,
    internalLogo: "tjrs",
    externalLogo: "govbr",
  }),

  //rotas de exemplos de componentes da biblioteca modelo-ui-lib
  { path: "samples", loadChildren: () => import("@ditic/modelo-ui-lib").then((mod) => mod.samplesRoutes) },

  { path: "**", component: TJRSPageNotFoundComponent },
];
