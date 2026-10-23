import { AsyncPipe } from "@angular/common";
import { Component, inject, input } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { TJRSAngularMaterialModule, TJRSUtilsService } from "@ditic/modelo-ui-lib";
import { map, switchMap } from "rxjs";
import { PalavraService } from "../palavra.service";

/**
 * Componente responsável pela edição de uma palavra existente
 *
 * Este componente é carregado quando o usuário clica no botão de edição de uma palavra na listagem
 * e permite a alteração dos dados de uma palavra já cadastrada no sistema.
 *
 * @remarks
 * Utiliza o componente de formulário reativo do Angular para gerenciar os dados do formulário
 * e o serviço PalavraService para realizar a comunicação com o backend.
 *
 * @example
 * <app-update></app-update>
 */
@Component({
  selector: "app-update",
  templateUrl: "./update.component.html",
  styleUrls: ["./update.component.scss"],
  imports: [FormsModule, ReactiveFormsModule, TJRSAngularMaterialModule, RouterLink, AsyncPipe],
})
export class UpdateComponent {
  /**
   * ID da palavra a ser editada, recebido como parâmetro da rota
   * Utiliza o novo recurso 'input' do Angular para receber parâmetros
   */
  id = input.required<number>();

  /** Serviço de utilidades para componentes responsivos */
  private utils = inject(TJRSUtilsService);

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
   * Formulário reativo para edição da palavra
   * Contém validações para os campos obrigatórios e formato de dados
   */
  palavraForm: UntypedFormGroup = new FormGroup({
    id: new FormControl({ value: null, disabled: true }, Validators.compose([Validators.required, Validators.pattern("^[0-9]*$")])),
    palavraChave: new FormControl(null, Validators.required),
    significado: new FormControl(null),
  });

  constructor() {
    /**
     * Carrega a palavra sempre que o ID da rota muda e preenche o formulário.
     * O switchMap cancela a requisição anterior se o ID mudar antes da resposta.
     */
    toObservable(this.id)
      .pipe(
        switchMap((id) => this.palavraService.get(id)),
        takeUntilDestroyed(),
      )
      .subscribe((res) => this.palavraForm.patchValue(res));
  }

  /**
   * Salva as alterações realizadas na palavra
   * Utiliza o serviço PalavraService para enviar os dados ao backend
   * e navega para a listagem após o sucesso da operação
   */
  salvar(): void {
    this.palavraService.update(this.palavraForm.getRawValue()).subscribe(() => {
      this.router.navigate(["/palavra"]);
    });
  }
}
