import fs from "fs/promises";
import path from "path";
import { CSSMetafileOutput, JSMetafileOutput } from "./types";
import { build_dpath } from "../file-paths";
import { BuildEnvironment } from "../../../environment/schema";
import { getPathFromRoot } from "../utils/root-path";

export async function writeManifest(
  jsFiles: JSMetafileOutput[],
  cssFiles: CSSMetafileOutput[],
  env: BuildEnvironment
) {
  console.log("Call to write manifest");
  const pkg = JSON.parse(
    await fs.readFile(getPathFromRoot("./package.json"), "utf-8")
  );

  const manifest = {
    icons: {
      16: "assets/icon16.png",
      32: "assets/icon32.png",
      48: "assets/icon48.png",
      128: "assets/icon128.png",
    },
    manifest_version: 3,
    action: {
      default_icon: {
        16: "assets/icon16.png",
        32: "assets/icon32.png",
        48: "assets/icon48.png",
        128: "assets/icon128.png",
      },
      default_popup: "popup.html",
    },
    version: pkg.version,
    author: pkg.author,
    name: "TabFlume",
    description: pkg.description,
    background:
      env.build_target === "chrome"
        ? {
            service_worker: jsFiles.find((a) => a.identifier === "background")
              ?.outputFilename,
          }
        : {
            scripts: [
              jsFiles.find((a) => a.identifier === "background")
                ?.outputFilename,
            ].filter(Boolean),
          },
    permissions: ["scripting", "tabs"],
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: [jsFiles.find((a) => a.identifier === "content")?.outputFilename],
        all_frames: true,
        run_at: "document_start",
      },
    ],
    web_accessible_resources: [
      {
        resources: [
          jsFiles.find((a) => a.identifier === "injected")?.outputFilename,
          "injected.js",
        ],
        matches: ["https://*/*", "http://*/*"],
      },
    ],
    host_permissions: ["<all_urls>"],
  };

  await fs.writeFile(
    path.join(build_dpath, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf-8"
  );

  console.log("Manifest writtem");
}
