import { safeReadJson } from "../utils/safe-read-json";
import { assertOrExit } from "../utils/assert";
import { build_params_prod_fpath } from "../file-paths";

export async function getEnvParams(env: string) {
  const params_raw = await safeReadJson(build_params_prod_fpath);

  assertOrExit(
    params_raw,
    `Missing build params for [${env}], expected JSON file [${build_params_prod_fpath}]`
  );

  const env_params = (params_raw as Record<string, unknown>)[env];

  assertOrExit(
    env_params,
    `Missing environment [${env}] in params file [${build_params_prod_fpath}]`
  );

  assertOrExit(
    !(typeof env_params !== "object" || Array.isArray(env_params)),
    "Invalid build params for environment, expected object"
  );

  return env_params as { [K in string]: unknown };
}
