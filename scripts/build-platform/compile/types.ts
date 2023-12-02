import type { Metafile } from 'esbuild';

export type MetafileOutput = Metafile['outputs'][string];
export type CSSMetafileOutput = MetafileOutput & {
  name: string;
  outputFilename: string;
};

export type JSMetafileOutput = MetafileOutput & {
  identifier: string;
  outputName: string;
  hash: string;
  outputFilename: string;
  entryFilename: string;
};
