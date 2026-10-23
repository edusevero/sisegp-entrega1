import { Component, inject } from "@angular/core";

import { RouterOutlet } from "@angular/router";
import { samplesMenuList, TJRSAngularMaterialModule, TJRSFooterComponent, TJRSHeaderComponent, TJRSProfileMenuItem, TJRSSidebarComponent, TJRSSidebarMenuList, TJRSUtilsService } from "@ditic/modelo-ui-lib";

import packageInfo from "../../package.json";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  imports: [TJRSHeaderComponent, TJRSSidebarComponent, RouterOutlet, TJRSFooterComponent, TJRSAngularMaterialModule],
})
export class AppComponent {
  private utils = inject(TJRSUtilsService);

  title = "Modelo";
  show = true;
  version = packageInfo.version;

  /**
   * [OPCIONAL] Adiciona menus customizados ao botão de perfil do header
   */
  profileMenu: TJRSProfileMenuItem[] = [
    {
      title: "Site TJRS",
      link: "https://www.tjrs.jus.br/novo",
      matIconName: "language",
      disabled: true,
      callBack: () => {
        alert("Chamando um CallBack qualquer como exemplo de implementação!");
      },
    },
  ];

  /**
   * [OPCIONAL] Adiciona menus customizados ao SideBar
   */
  menu: TJRSSidebarMenuList = {
    menuList: [
      {
        header: "Menus",
        itemList: [
          {
            title: "Palavras",
            routerLink: "palavra",
            matIconName: "reorder",
          },
          {
            title: "Sabedoria",
            routerLink: "sabedoria",
            matIconName: "android",
          },
          {
            title: "Login Híbrido",
            routerLink: "login",
            matIconName: "login",
          },
        ],
      },
      ...samplesMenuList,
    ],
  };
}
