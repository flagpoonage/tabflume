export const extension = ((globalThis as any).browser ??
  globalThis.chrome) as unknown as typeof chrome;
