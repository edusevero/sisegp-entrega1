import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { TokenChallengeService } from "../shared/token.challenge.service";
import { TokenChallengeResponse } from "../shared/model/token.challenge";

@Injectable({
  providedIn: "root",
})
export class SabedoriaService {
  /**
   * Método mais moderno para injeção de dependências
   * Não é necessário incluir no construtor da classe, facilitando extensão para outras funcionalidades
   */
  private http = inject(HttpClient);
  private tokenChallengeService = inject(TokenChallengeService);

  async getChallenge(): Promise<string | null> {
    try {
      return await this.tokenChallengeService.generate('sabedoria');
    } catch (error) {
      console.error('Error generating challenge token:', error);
      return null;
    }
  }

  get(altcha: string): Observable<TokenChallengeResponse|undefined> {
    console.log("SabedoriaService.get " + altcha);
    return this.http
      .get<TokenChallengeResponse>(`${environment.apiUrl}/public/ia/conselho`, { 
        params: { altcha },
        responseType: "json" 
      });
  }

}