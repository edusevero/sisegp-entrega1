import { AbstractControl } from "@angular/forms";

/**
 * Interface que define a estrutura do formulário de palavras
 *
 * Esta interface garante a tipagem forte para os controles do formulário reativo,
 * facilitando o acesso e manipulação dos campos nos componentes de adição e edição.
 *
 * @remarks
 * A interface proporciona autocomplete e verificação de tipo em tempo de desenvolvimento,
 * reduzindo erros e melhorando a manutenibilidade do código.
 */
export interface PalavraFormModel {
  /**
   * Controle para o campo ID da palavra
   * Somente leitura no formulário de edição, não presente no formulário de adição
   */
  id: AbstractControl<number | null, number>;

  /**
   * Controle para o campo palavra-chave
   * Campo principal obrigatório em ambos os formulários (adição e edição)
   */
  palavraChave: AbstractControl<string | null, string>;

  /**
   * Controle para o campo significado
   * Campo opcional que contém a descrição detalhada da palavra
   */
  significado: AbstractControl<string | null, string>;

  /**
   * Controle para o campo de captcha
   * Usado em alguns formulários para validação anti-bot
   */
  captcha?: AbstractControl<string | null, string>;
}
