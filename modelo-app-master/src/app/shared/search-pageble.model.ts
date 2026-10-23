/**
 * Interface Genérica para consultas paginadas ao backend modelo Spring, com atributos úteis para paginação de consultas,
 * a interface recebe como parâmetro (T) qualquer tipo de objeto (interface)
 *
 * Por Exemplo, se você quiser consultar uma lista de pessoas do tipo:
 *
 * interface Pessoa {
 *   nome: string;
 *   cpf: string;
 * }
 *
 * de um backend paginado, a interface recebiba de serviço pode ser assinada assim;
 *
 * resultado: TJRSSearchPageable<Pessoa>
 *
 * this.myService.getPessoas().subscribe((res)=>{this.resultado = res;})
 *
 * a lista de pessoas estará no array resultado.content...
 */
export interface TJRSSearchPageable<T> {
  content: T[];
  pageable: TJRSPageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  sort: TJRSSort;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  empty: boolean;
}

interface TJRSPageable {
  sort: TJRSSort;
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

interface TJRSSort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}
