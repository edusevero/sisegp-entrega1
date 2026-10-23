import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { TJRSSearchPageable } from "../shared/search-pageble.model";
import { PalavraItem } from "./palavra";

/**
 * Serviço para consulta ao backend modelo-service
 *
 * Este serviço encapsula todas as chamadas HTTP para o backend relacionadas às operações CRUD de palavras.
 * Fornece métodos para buscar, adicionar, atualizar e remover palavras do sistema.
 *
 * @remarks
 * Documentação do serviço: https://k8s-intra-dev.tjrs.jus.br/api/modelo/swagger-ui/index.html
 */
@Injectable({
  providedIn: "root",
})
export class PalavraService {
  /**
   * Método mais moderno para injeção de dependências
   * Não é necessário incluir no construtor da classe, facilitando extensão para outras funcionalidades
   */
  private http = inject(HttpClient);

  /**
   * Exemplo de chamada de serviço para buscar informações
   * @param id Identificador único da palavra
   * @returns Observable com os dados da palavra encontrada
   */
  get(id: number): Observable<PalavraItem> {
    console.log("PalavraService.get " + id);
    return this.http.get<PalavraItem>(`${environment.apiUrl}/palavra/${id}`);
  }

  /**
   * Busca todas as palavras cadastradas no sistema
   * @returns Observable com array de palavras ordenadas por ID
   */
  getAll(): Observable<PalavraItem[]> {
    console.log("PalavraService.getAll");
    return this.http
      .get<PalavraItem[]>(`${environment.apiUrl}/palavra`)
      .pipe(map((palavras) => [...palavras].sort((a: PalavraItem, b: PalavraItem) => a.id - b.id)));
  }

  /**
   * Exemplo de chamada de serviço com paginação
   * Utilizado para tabelas com muitos registros, otimizando o frontend
   *
   * @param termoPesquisa Texto para filtrar na busca
   * @param params Parâmetros de paginação e ordenação
   * @returns Lista de palavras com paginação
   */
  search(termoPesquisa = "", params = ""): Observable<TJRSSearchPageable<PalavraItem>> {
    console.log("PalavraService.search");
    return this.http.get<TJRSSearchPageable<PalavraItem>>(`${environment.apiUrl}/buscar?termoPesquisa=${termoPesquisa}&${params}`);
  }

  /**
   * Exemplo de chamada para INSERT de dados
   *
   * @param palavra Objeto com dados da palavra a ser cadastrada
   * @returns Observable com resultado da operação
   */
  add(palavra: PalavraItem): Observable<unknown> {
    console.log("PalavraService.add", palavra);
    return this.http.post<PalavraItem>(`${environment.apiUrl}/palavra`, palavra).pipe(tap((res) => console.log("Palavra Adicionada", res)));
  }

  /**
   * Exemplo de chamada para DELETE de dados
   *
   * @param id Identificador único da palavra a ser removida
   * @returns Observable com resultado da operação
   */
  remove(id: string | number): Observable<unknown> {
    console.log("PalavraService.remove", id);
    return this.http.delete<PalavraItem>(`${environment.apiUrl}/palavra/${id}`).pipe(tap((res) => console.log("Palavra Removida", res)));
  }

  /**
   * Exemplo de chamada para UPDATE de dados
   *
   * @param palavra Objeto com dados atualizados da palavra
   * @returns Observable com resultado da operação
   */
  update(palavra: PalavraItem): Observable<unknown> {
    console.log("PalavraService.update", palavra);
    return this.http.put<PalavraItem>(`${environment.apiUrl}/palavra`, palavra).pipe(tap((res) => console.log("Palavra Atualizada", res)));
  }
}
