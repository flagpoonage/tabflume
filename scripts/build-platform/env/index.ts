import { getDevParams } from "./dev";
import { getEnvParams } from "./env";
import { writeParams } from "./write-params";
import mergeDeep from "./deep-merge";
import { DEFAULT_ENVIRONMENT } from "../../../environment/default-environment";
import {
  BuildEnvironment,
  envSchemaValidator,
} from "../../../environment/schema";
import { flattenError } from "dealwith";
import { exitMessage } from "../utils/assert";
import {
  env_define_output_fpath,
  env_params_output_fpath,
} from "../file-paths";

export async function generateEnvironment(environment?: string) {
  const env_name = environment ?? "dev";
  console.log(`Generating environment configuration for [${env_name}]`);

  const params = await (!environment
    ? getDevParams()
    : getEnvParams(environment));

  console.log(`Loaded parameters for environment [${env_name}]`);
  console.log(`Mergin parameters for environment [${env_name}]...`);

  const fullParams = mergeDeep<BuildEnvironment>(DEFAULT_ENVIRONMENT, params);

  console.log("PARAMS", params);

  console.log(`Parameters merged for environment [${env_name}]`);
  console.log(`Validating parameters for environment [${env_name}]...`);

  const validationResult = envSchemaValidator(fullParams);

  if (validationResult.hasError) {
    exitMessage(
      "Invalid environment configuration",
      flattenError(validationResult)
    );
  }

  console.log(`Parameters validated for environment [${env_name}]`);
  console.log(`Generating built-in environment files at`, [
    env_define_output_fpath,
    env_params_output_fpath,
  ]);

  await writeParams(fullParams);

  console.log(`Generated environment artifacts for [${env_name}]`);
}
