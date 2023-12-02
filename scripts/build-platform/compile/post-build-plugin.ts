import type { PluginBuild } from "esbuild";
import fs from "fs/promises";
import path from "path";
import { CSSMetafileOutput, JSMetafileOutput } from "./types";
import { writeTemplate } from "./write-template";
import { build_dpath, popup_dpath, tabs_dpath } from "../file-paths";
import { writeManifest } from "./write-manifest";
import { BuildEnvironment } from "../../../environment/schema";
import { getPathFromRoot } from "../utils/root-path";

const time = () => new Date().getTime();

export const postBuildPlugin = (
  tabs: { index: string; name: string }[],
  env: BuildEnvironment
) => ({
  name: "postbuild",
  setup(build: PluginBuild) {
    let laststart = time();
    build.onStart(() => {
      laststart = time();
    });
    build.onEnd(async (result) => {
      const css_files = [] as CSSMetafileOutput[];

      if (!result.metafile) {
        console.error("No metafile was generated");
        return;
      }

      let injected: any = null;

      // Extract hashes, filenames without paths, CSS files, etc
      const js_files = Object.entries(result.metafile.outputs).reduce(
        (acc, [outputName, info]) => {
          const hash = outputName.split(".").slice(-2)[0];
          const outputFilename = path.basename(outputName);
          const name = outputFilename.split(`.${hash}`)[0];

          if (name === "injected") {
            injected = {
              name,
              outputFilename,
              hash,
            };
          }

          if (path.extname(outputFilename) === ".css") {
            css_files.push(
              Object.assign({}, info, {
                name,
                outputFilename,
              })
            );

            return acc;
          }

          if (!info.entryPoint) {
            console.warn("Missing expected entrypoing", info.entryPoint);
            return acc;
          }

          const entryFilename = path.basename(info.entryPoint);
          acc.push(
            Object.assign({}, info, {
              identifier: name,
              outputName,
              hash,
              outputFilename,
              entryFilename,
            })
          );

          return acc;
        },
        [] as JSMetafileOutput[]
      );

      console.log("Got injected", injected);

      if (injected) {
        await fs.cp(
          path.join(build_dpath, injected.outputFilename),
          path.join(build_dpath, "injected.js")
        );
      }

      for (const entry of js_files) {
        console.log(
          `Built [${entry.entryFilename}] with hash [${entry.hash}] as [${entry.outputFilename}]`
        );
      }

      // Load HTML templates for replacement

      for (const tab_source of tabs) {
        const output = js_files.find(
          (a) => a.entryFilename === `${tab_source.name}.ts`
        );
        if (!output) {
          console.warn("Missing expected tab in output", tab_source);
          continue;
        }

        const css_file = css_files.find((a) => a.name === tab_source.name);
        const html_fname = `${tab_source.name}.html`;

        await writeTemplate(
          path.join(tabs_dpath, "template.html"),
          path.join(build_dpath, html_fname),
          {
            scriptPath: output.outputFilename,
            cssPath: css_file?.outputFilename,
          }
        );

        console.log(`Built HTML template for [${html_fname}]`);
      }

      console.log("Writing manifest?");

      const popup = js_files.find((a) => a.identifier === "popup");

      const css_file = css_files.find((a) => a.name === "popup");

      if (popup) {
        await writeTemplate(
          path.join(popup_dpath, "popup.html"),
          path.join(build_dpath, `popup.html`),
          {
            scriptPath: popup.outputFilename,
            cssPath: css_file?.outputFilename,
          }
        );
      } else {
        console.warn("Missing popup JS file");
      }

      await writeManifest(js_files, css_files, env);

      /**
       * Inject email notifier component files
       *
       * TODO: Transition from the usage of `innerHTML` to a programmatic approach for building elements.
       * The current implementation of this component is dependent on `innerHTML`, triggering a `TrustedHTML` error.
       *
       * Notably, the component renders accurately despite the error's implication (`TypeError: Failed to set the 'innerHTML' property on 'Element'`).
       *
       * This change should be done within the `sqrx-framework` during the compilation phase.
       */
      await fs.cp(
        getPathFromRoot(
          "./node_modules/@sqrx/sqrx-email-notifier/dist/sqrx-email-notifier"
        ),
        path.join(build_dpath, "sqrx-email-notifier"),
        { recursive: true }
      );

      console.info("Build completed in", time() - laststart, "milliseconds");
    });
  },
});
