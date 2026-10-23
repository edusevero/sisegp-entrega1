/**
 * Interface que define a estrutura básica de uma palavra no sistema
 *
 * Esta interface é utilizada para tipagem dos dados recebidos da API e manipulação
 * nos componentes da aplicação.
 */
export interface PalavraItem {
  /**
   * Identificador único da palavra
   * Gerado automaticamente pelo backend
   */
  id: number;

  /**
   * Texto da palavra-chave
   * Campo obrigatório
   */
  palavraChave: string;

  /**
   * Descrição detalhada do significado da palavra
   * Campo opcional
   */
  significado: string;
}
