/** Logs only in development — avoids noisy production auth/OAuth traces. */
export function devLog(...args: unknown[]): void {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
}
