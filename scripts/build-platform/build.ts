import { compile } from "./compile";
import { generateEnvironment } from "./env";
import chokidar from "chokidar";
import { getPathFromRoot } from "./utils/root-path";
import { assets_dpath, build_dpath } from "./file-paths";
import { execSync } from "child_process";
import path from "path";

const args = process.argv;

const env = (() => {
  const env = args.find((a) => a.startsWith("--env="));
  return env ? env.split("--env=")[1] : undefined;
})();

const watch = !!args.find((a) => a === "--watch");

const build_state = {
  is_running: false,
  is_queued: false,
};

async function run() {
  execSync(
    `rm -rf ${build_dpath} && mkdir ${build_dpath} && cp -rf ${path.join(
      assets_dpath
    )} ${build_dpath}`
  );
  while (build_state.is_queued && !build_state.is_running) {
    try {
      build_state.is_queued = false;
      build_state.is_running = true;
      await generateEnvironment(env);
    } catch (exception) {
      console.error("Exception before compiler", exception);
    }

    try {
      await compile();
    } catch (ex) {
      // TODO: Do nothing, it will be taken care of by esbuild
    } finally {
      build_state.is_running = false;
    }
  }
}

async function watchSource() {
  const watcher = chokidar.watch(getPathFromRoot("./src"));

  process.on("SIGINT", () => {
    console.log("Closing chokidar file watcher on SIGINT");
    watcher.close();
  });

  watcher.on("ready", async () => {
    build_state.is_queued = true;
    await run();
  });

  function queueRun() {
    build_state.is_queued = true;

    if (!build_state.is_running) {
      run();
    }
  }

  watcher.on("addDir", queueRun);
  watcher.on("add", queueRun);
  watcher.on("unlinkDir", queueRun);
  watcher.on("unlink", queueRun);
  watcher.on("change", queueRun);
}

if (watch) {
  watchSource();
} else {
  build_state.is_queued = true;
  run();
}
