import { AsyncPipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { TJRSAngularMaterialModule, TJRSUtilsService } from "@ditic/modelo-ui-lib";
import { map } from "rxjs";
import { PalavraService } from "../palavra.service";

/**
 * Componente responsável pela adição de novas palavras
 *
 * Este componente é carregado quando o usuário clica no botão de adicionar palavra na listagem
 * e permite o cadastro de uma nova palavra no sistema.
 *
 * @remarks
 * Utiliza o componente de formulário reativo do Angular para gerenciar os dados do formulário
 * e o serviço PalavraService para realizar a comunicação com o backend.
 * Apenas usuários com a role 'administrador' têm acesso a este componente.
 *
 * @example
 * <app-add></app-add>
 */
@Component({
  selector: "app-add",
  templateUrl: "./add.component.html",
  styleUrls: ["./add.component.scss"],
  imports: [FormsModule, ReactiveFormsModule, TJRSAngularMaterialModule, RouterLink, AsyncPipe],
})
export class AddComponent {
  /** Serviço de utilidades para componentes responsivos */
  private utils = inject(TJRSUtilsService);

  /** FormBuilder para criação do formulário reativo */
  private fb = inject(UntypedFormBuilder);

  /** Router para navegação após salvar ou cancelar */
  private router = inject(Router);

  /** Serviço para comunicação com a API de palavras */
  private palavraService = inject(PalavraService);

  /**
   * Controla a direção do layout com base no tamanho da tela
   * @returns 'flex-col' para dispositivos móveis e 'flex-row' para desktop
   */
  direction = this.utils.isHandset().pipe(map((result: boolean) => (result ? "flex-col" : "flex-row")));

  /**
   * Formulário reativo para cadastro da nova palavra
   * Contém validações para os campos obrigatórios
   */
  palavraForm: UntypedFormGroup = this.fb.group({
    palavraChave: [null, Validators.required],
    significado: [null],
  });

  /**
   * Salva a nova palavra cadastrada
   * Utiliza o serviço PalavraService para enviar os dados ao backend
   * e navega para a listagem após o sucesso da operação
   */
  salvar(): void {
    this.palavraService.add(this.palavraForm.value).subscribe(() => {
      this.router.navigate(["/palavra"]);
    });
  }
}
