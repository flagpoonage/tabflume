export function assertOrExit(
  condition: unknown,
  emsg: string,
  ...args: unknown[]
): asserts condition {
  if (!condition) {
    return exitMessage(emsg, ...args);
  }
}

export function exitMessage(msg: string, ...args: unknown[]) {
  console.error(msg, ...args);
  return process.exit(1);
}
