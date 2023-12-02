import { path } from '../utils/paths';
export const rootDirectory = path.join(__dirname, '../');

export function getPathFromRoot(subPath: string) {
  return path.join(rootDirectory, subPath);
}
