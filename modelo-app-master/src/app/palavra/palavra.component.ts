import { AfterViewInit, Component, inject, signal, viewChild } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { RouterModule } from "@angular/router";
import { TJRSAngularMaterialModule, TJRSDialogData, TJRSKeycloakRolesDirective, TJRSLoadingDirective, TJRSMatTableResponsiveDirective, TJRSSearchInputComponent, TJRSUtilsService } from "@ditic/modelo-ui-lib";
import { catchError, delay, distinctUntilChanged, map, merge, of, skip, startWith, switchMap } from "rxjs";
import { PalavraItem } from "./palavra";
import { PalavraService } from "./palavra.service";

/**
 * Componente principal responsável pela listagem de palavras
 *
 * Este componente exibe uma tabela com paginação e ordenação das palavras cadastradas no sistema.
 * Permite acesso aos recursos de adicionar, editar e excluir palavras com controle de permissões.
 *
 * @remarks
 * Utiliza a diretiva TJRSKeycloakRolesDirective para controle de acesso baseado em papéis (roles)
 * e o componente MatTable para exibição dos dados em formato tabular com recursos avançados.
 *
 * @example
 * <app-palavra></app-palavra>
 */
@Component({
  selector: "app-palavra",
  templateUrl: "./palavra.component.html",
  styleUrls: ["./palavra.component.scss"],
  imports: [RouterModule, TJRSAngularMaterialModule, TJRSMatTableResponsiveDirective, TJRSKeycloakRolesDirective, TJRSSearchInputComponent, TJRSLoadingDirective],
})
export class PalavraComponent implements AfterViewInit {
  /** Injeção de dependências usando o método moderno do Angular */
  private palavraService = inject(PalavraService);
  private utils = inject(TJRSUtilsService);

  /**
   * Dados da tabela usando o novo recurso de signals do Angular
   * Permite atualizações reativas na interface quando os dados são alterados
   */
  palavras = signal<PalavraItem[]>([]);

  /** Colunas exibidas na tabela de palavras */
  displayedColumns: string[] = ["id", "palavraChave", "significado", "actions"];

  /** Referências aos componentes de paginação e ordenação */
  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

  /** Termo de pesquisa informado no campo de busca */
  searchTerm = signal("");

  /** Estado de loading exibido sobre a tabela durante a busca */
  loading = signal(false);

  /**
   * Observable do termo de pesquisa, ignorando a emissão inicial (já coberta pelo startWith em ngAfterViewInit)
   * Criado em field initializer pois toObservable() exige contexto de injeção (NG0203)
   */
  private readonly searchTerm$ = toObservable(this.searchTerm).pipe(skip(1), distinctUntilChanged());

  /**
   * Hook de ciclo de vida executado após inicialização da view
   * Configura a paginação, ordenação e carregamento dos dados
   */
  ngAfterViewInit(): void {
    // Resetar para primeira página quando alterar ordenação
    this.sort().sortChange.subscribe(() => (this.paginator().pageIndex = 0));

    // Resetar para primeira página quando alterar o termo de pesquisa
    this.searchTerm$.subscribe(() => (this.paginator().pageIndex = 0));

    // Combinação de eventos para atualizar os dados quando algum dos observables quando alterados
    merge(this.sort().sortChange, this.paginator().page, this.searchTerm$)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.loading.set(true);
          // Parâmetros para a pesquisa paginada
          const page = this.paginator().pageIndex ?? 0;
          const size = this.paginator().pageSize ?? 10;
          const sortValue = this.sort();
          const sort = sortValue.direction !== "" ? `${sortValue.active},${sortValue.direction}` : "";
          const params = `page=${page}&size=${size}&sort=${sort}`;

          return this.palavraService.search(this.searchTerm(), params).pipe(
            delay(1000), // delay adicionado para simulação do loader
            catchError(() => of(null)),
          );
        }),
        map((res) => {
          if (res === null || res.content === null || res.content.length === 0) {
            return [];
          }

          // Atualização dos dados de paginação
          this.paginator().pageIndex = res.number;
          this.paginator().pageSize = res.size;
          this.paginator().length = res.totalElements;

          this.loading.set(false);

          return res.content;
        }),
      )
      .subscribe((data) => this.palavras.set(data));
  }

  /**
   * Atualiza o termo de pesquisa a partir do campo de busca
   * Dispara automaticamente uma nova busca paginada (ver ngAfterViewInit)
   *
   * @param termo Texto informado pelo usuário no campo de busca
   */
  onSearch(termo: string): void {
    this.searchTerm.set(termo);
  }

  /**
   * Remove uma palavra do sistema
   * Exibe um diálogo de confirmação antes de realizar a exclusão
   *
   * @param palavra Item a ser removido
   */
  removeItem(palavra: PalavraItem): void {
    const titulo = "Remover Palavra";
    const mensagem = `Deseja excluir a palavra <b>${palavra.palavraChave}</b>?`;

    this.utils
      .showDialogConfirmation({
        title: titulo,
        content: mensagem,
      } as TJRSDialogData)
      .subscribe((ok) => {
        if (!ok) {
          return;
        }

        this.palavraService.remove(palavra.id).subscribe(() => {
          // Atualiza a lista local usando signals para refletir a mudança
          this.palavras.set(this.palavras().filter((p) => p.id !== palavra.id));
        });
      });
  }
}
