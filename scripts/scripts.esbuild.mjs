import { execSync } from "child_process";
import esbuild from "esbuild";
import path from "path";

import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const artifacts_dir = path.join(__dirname, "../.build");

execSync(`mkdir -p ${artifacts_dir}`);

esbuild.buildSync({
  entryPoints: [path.join(__dirname, "./build-platform/build.ts")],
  bundle: true,
  platform: "node",
  target: "node16",
  entryNames: "[name]",
  external: ["esbuild", "prettier"],
  sourcemap: "inline",
  outdir: path.join(__dirname, "../.build"),
});
