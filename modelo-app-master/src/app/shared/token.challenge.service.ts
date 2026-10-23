import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { solveChallengeWorkers } from "altcha-lib";
import { Challenge, Payload } from "altcha-lib/types";
import { environment } from "../../environments/environment";
import { worker } from "../../utils/altcha-worker-creator";

@Injectable({
  providedIn: "root",
})
export class TokenChallengeService {
  private workerCount: number = environment.altcha.worker

  public async generate(origin: string = "unknown"): Promise<string | null> {

    try {
      console.debug("[ALTCHA] Generate(0) for: ", origin);

      const challenge = await this.getChallenge();
      console.debug("[ALTCHA] Challenge(1): ", challenge);

      const solution = await solveChallengeWorkers(worker, this.workerCount, challenge.challenge, challenge.salt, challenge.algorithm, challenge.maxnumber);
      console.debug("[ALTCHA] Solution(2): ", solution);

      if (!solution) {
        throw new Error("[ALTCHA] Invalid solution");
      }

      const payload: Payload = {
        algorithm: challenge.algorithm,
        challenge: challenge.challenge,
        number: solution?.number ?? 0,
        salt: challenge.salt,
        signature: challenge.signature,
      };

      const data = btoa(JSON.stringify(payload));
      return await data;

    } catch (error) {
      console.debug("[ALTCHA] ", error);
      return Promise.reject(new HttpErrorResponse({ error: error, status: 401 }));
    }
  }

  private async getChallenge(): Promise<Challenge> {
    const response = await fetch(`${environment.apiUrl}/public/challenge`);
    return await response.json();
  }

}
