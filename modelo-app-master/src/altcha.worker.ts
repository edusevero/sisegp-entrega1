/// <reference lib="webworker" />

import { solveChallenge } from "altcha-lib";

interface MessagePayload {
  type: string;
  payload: {
    algorithm: string;
    challenge: string;
    max: number;
    salt: string;
    start: number;
  };
}

let controller: AbortController | undefined = undefined;

addEventListener("message", async (event: MessageEvent<MessagePayload>) => {
  const { type, payload } = event.data;

  if (type === "abort") {
    controller?.abort();
    controller = undefined;
    console.debug("[WEBWORKER] abort!");
  } else if (type === "work" && payload) {
    const { algorithm, challenge, max, salt, start } = payload;
    try {
      const result = solveChallenge(challenge, salt, algorithm, max, start);
      controller = result.controller;
      const solution = await result.promise;
      self.postMessage(solution ? { ...solution, worker: true } : solution);
      console.debug("[WEBWORKER] work!");
    } catch (error) {
      console.debug("[WEBWORKER] Error:", error);
    }
  }
});
