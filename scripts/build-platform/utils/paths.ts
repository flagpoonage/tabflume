import * as path_root from "path";

export const path = process.cwd().includes(path_root.win32.sep)
  ? path_root.win32
  : path_root.posix;
