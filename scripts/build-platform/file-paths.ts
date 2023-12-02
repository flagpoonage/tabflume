import { getPathFromRoot } from "./utils/root-path";

export const build_params_prod_fpath = getPathFromRoot(
  "./environment/build-params.json"
);
export const build_params_dev_fpath = getPathFromRoot(
  "./environment/build-params.dev.json"
);

export const env_define_output_fpath = getPathFromRoot("./.build/define.json");
export const env_params_output_fpath = getPathFromRoot("./.build/env.json");
export const content_index_fpath = getPathFromRoot("./src/content/content.ts");
export const injected_index_fpath = getPathFromRoot(
  "./src/injected/injected.ts"
);
export const background_index_fpath = getPathFromRoot(
  "./src/background/background.ts"
);
export const popup_index_fpath = getPathFromRoot("./src/popup/popup.ts");
export const tabs_dpath = getPathFromRoot("./src/tabs/");
export const build_dpath = getPathFromRoot("./build");
export const assets_dpath = getPathFromRoot("./assets");
export const popup_dpath = getPathFromRoot("./src/popup");
