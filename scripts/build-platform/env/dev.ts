import { build_params_dev_fpath } from '../file-paths';
import { assertOrExit } from '../utils/assert';
import { safeReadJson } from '../utils/safe-read-json';

export async function getDevParams() {
  const params_raw = await safeReadJson(build_params_dev_fpath);

  assertOrExit(
    params_raw,
    `Missing build params for dev, expected JSON file [${build_params_dev_fpath}]`,
  );

  assertOrExit(
    typeof params_raw === 'object' && !Array.isArray(params_raw),
    'Invalid build params for environment, expected object',
  );

  console.log('RAW DEV PARAMS', params_raw);

  return params_raw;
}
