export function worker():Worker {
    return new Worker(new URL("../altcha.worker", import.meta.url));
}
