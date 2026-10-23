import { Component, inject, signal } from "@angular/core";

import { TJRSAngularMaterialModule, TJRSNoteComponent } from "@ditic/modelo-ui-lib";
import { SabedoriaService } from "./sabedoria.service";

@Component({
  selector: "app-sabedoria",
  imports: [TJRSNoteComponent, TJRSAngularMaterialModule],
  templateUrl: "./sabedoria.component.html",
  styleUrl: "./sabedoria.component.scss",
})
export class SabedoriaComponent {
  private sabedoriaService = inject(SabedoriaService);

  // Signals: o estado muda após await e dentro de subscribe; sem Zone.js, só signal atualiza a tela
  fraseSabedoria = signal<string | undefined>(undefined);
  private altcha = signal<string | null | undefined>(undefined);

  constructor() {
    this.initChallenge();
  }

  private async initChallenge() {
    try {
      this.altcha.set(await this.sabedoriaService.getChallenge());

      if (!this.altcha()) {
        throw new Error("Falha ao gerar token de desafio");
      }
    } catch (error) {
      console.error("Erro no processo de consulta:", error);
      this.fraseSabedoria.set("Não foi possível obter uma frase de sabedoria. Tente novamente mais tarde.");
    }
  }

  consultarIA() {
    const altcha = this.altcha();
    if (!altcha) {
      console.error("Erro no processo de consulta: token não está disponível");
      this.fraseSabedoria.set("Não foi possível obter uma frase de sabedoria. Tente novamente mais tarde.");
      return;
    }

    this.sabedoriaService.get(altcha).subscribe({
      next: (response) => {
        if (response?.sabedoria) {
          this.fraseSabedoria.set(response.sabedoria);
        } else {
          console.warn("Resposta da IA não contém frase de sabedoria");
          this.fraseSabedoria.set("Não foi possível obter uma frase de sabedoria.");
        }
      },
      error: (error) => {
        console.error("Erro ao consultar a IA:", error);
        this.fraseSabedoria.set("Não foi possível obter uma frase de sabedoria. Tente novamente mais tarde.");
      },
    });
  }
}
