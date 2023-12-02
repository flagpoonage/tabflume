import * as fs from "fs/promises";
import { BuildEnvironment } from "../../../environment/schema";
import { exitMessage } from "../utils/assert";
import {
  env_define_output_fpath,
  env_params_output_fpath,
} from "../file-paths";

export async function writeParams(env: BuildEnvironment) {
  const outputParams = deepWriteParams(env);

  try {
    await fs.writeFile(env_params_output_fpath, JSON.stringify(env), "utf-8");
  } catch (exception) {
    exitMessage(
      `Unable to generate environment file at [${env_params_output_fpath}]`,
      exception
    );
  }

  try {
    await fs.writeFile(
      env_define_output_fpath,
      JSON.stringify(outputParams),
      "utf-8"
    );
  } catch (exception) {
    exitMessage(
      `Unable to generate definition data file at [${env_define_output_fpath}]`,
      exception
    );
  }
}

function deepWriteParams(
  env: unknown,
  path = "BUILD_ENV",
  output = {} as Record<string, string>
): Record<string, string> {
  if (env === null) {
    output[path] = `null`;
    return output;
  }

  if (typeof env === "object") {
    if (Array.isArray(env)) {
      output[path] = `${JSON.stringify(env)}`;
      return output;
    } else {
      Object.keys(env).forEach((key) => {
        const nextPath = [path, key].join(".");
        deepWriteParams((env as Record<string, string>)[key], nextPath, output);
      });
      return output;
    }
  }

  if (typeof env === "string") {
    output[path] = `"${env}"`;
    return output;
  } else {
    output[path] = `${env}`;
    return output;
  }
}
