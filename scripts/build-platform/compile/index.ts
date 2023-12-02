import esbuild, { BuildOptions } from "esbuild";
import fs from "fs/promises";
import {
  background_index_fpath,
  build_dpath,
  content_index_fpath,
  env_define_output_fpath,
  env_params_output_fpath,
  injected_index_fpath,
  popup_index_fpath,
  tabs_dpath,
} from "../file-paths";
import { BuildEnvironment } from "../../../environment/schema";
import { postBuildPlugin } from "./post-build-plugin";
import { path } from "../utils/paths";

export async function compile() {
  const tabs = await getTabIndices();

  const define = JSON.parse(
    await fs.readFile(env_define_output_fpath, "utf-8")
  );

  const env = JSON.parse(
    await fs.readFile(env_params_output_fpath, "utf-8")
  ) as BuildEnvironment;

  const build_options: BuildOptions = {
    entryPoints: [
      background_index_fpath,
      content_index_fpath,
      popup_index_fpath,
      injected_index_fpath,
      ...tabs.map((a) => a.index),
    ],
    entryNames: "[name].[hash]",
    sourcemap: process.env.IS_DEV ? "inline" : false,
    minify: !process.env.IS_DEV,
    minifySyntax: true,
    bundle: true,
    outdir: build_dpath,
    metafile: true,
    loader: {
      ".png": "base64",
    },
    define: {
      ...define,
      "process.env.IS_TESTING": "false",
      "process.env.NODE_ENV": process.env.IS_DEV
        ? '"development"'
        : '"production"',
    },
    // Most of the magic specific to our extension happens here
    plugins: [postBuildPlugin(tabs, env)],
  };

  return esbuild.build(build_options);
}

export async function getTabIndices() {
  const tabs = await fs.readdir(tabs_dpath);

  const tab_paths = [] as { index: string; name: string }[];

  for (const dirname of tabs) {
    const dirpath = path.join(tabs_dpath, dirname);
    const stat = await fs.stat(dirpath);
    if (!stat.isDirectory()) {
      continue;
    }

    const dir_files = await fs.readdir(dirpath);
    const fname = `${dirname}.ts`;

    if (dir_files.includes(fname)) {
      tab_paths.push({
        index: path.join(dirpath, fname),
        name: dirname,
      });
    }
  }

  return tab_paths;
}
