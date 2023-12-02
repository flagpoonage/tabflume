import * as path_root from "path";

export const path = process.cwd().includes(path_root.win32.sep)
  ? path_root.win32
  : path_root.posix;

const MODULE_PATH = "src/modules";

export function maybeAdditionalPath(
  rootPath: string,
  additionalPaths: string[]
) {
  return additionalPaths.length > 0
    ? path.join(rootPath, ...additionalPaths)
    : rootPath;
}

export function getModulePath(...additionalPaths: string[]) {
  return maybeAdditionalPath(MODULE_PATH, additionalPaths);
}

export function isModuleRootDirectory(path: string) {
  const split = path.split("/");
  if (split.length !== 3 || split[0] !== "src" || split[1] !== "modules") {
    return false;
  }

  return true;
}
