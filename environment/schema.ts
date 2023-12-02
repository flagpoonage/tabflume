import { DW as v, ValidatorFunctionResultType } from "dealwith";

export const envSchemaValidator = v.object().schema({
  build_target: v.string().allowed("firefox", "chrome"),
});

export type BuildEnvironment = ValidatorFunctionResultType<
  typeof envSchemaValidator
>;

type NestedPartial<T> = T extends (...args: any[]) => any
  ? T
  : T extends { [K in PropertyKey]: unknown }
    ? NestedObjectPartial<T>
    : T;

type NestedObjectPartial<T> = {
  [P in keyof T]?: NestedPartial<T[P]>;
};

export type BuildEnvironmentInput = NestedObjectPartial<BuildEnvironment>;
