import { InferSchema, makeTypeAssertion, DW as v } from "dealwith";

export const consoleCaptureSchema = v.object().schema({
  type: v.string().allowed("log", "warn", "error", "info", "debug"),
  arguments: v.array(),
  time: v.number(),
});

export function createConsoleCapture(
  type: ConsoleCapture["type"],
  args: unknown[]
): ConsoleCapture {
  return {
    type,
    arguments: args,
    time: performance.now(),
  };
}

export const batchCommsToBackgroundSchema = v.object().schema({
  type: v.string().equals("batchcomms_tobackground"),
  logs: v.array().items(consoleCaptureSchema),
});

export function createBatchCommsToBackground(
  logs: ConsoleCapture[]
): BatchCommsToBackground {
  return {
    type: "batchcomms_tobackground",
    logs,
  };
}

export const batchCommsToDisplayPageSchema = v.object().schema({
  type: v.string().equals("batchcomms_todisplaypage"),
  tab: v.object().schema({
    id: v.number(),
    url: v.string(),
  }),
  logs: v.array().items(consoleCaptureSchema),
});

export function createBatchCommsToDisplayPage(
  logs: ConsoleCapture[],
  tab: BatchCommsToDisplayPageSchema["tab"]
): BatchCommsToDisplayPageSchema {
  return {
    type: "batchcomms_todisplaypage",
    tab,
    logs,
  };
}

export type ConsoleCapture = InferSchema<typeof consoleCaptureSchema>;
export type BatchCommsToBackground = InferSchema<
  typeof batchCommsToBackgroundSchema
>;
export type BatchCommsToDisplayPageSchema = InferSchema<
  typeof batchCommsToDisplayPageSchema
>;

export const isConsoleCapture = makeTypeAssertion(consoleCaptureSchema);
export const isBatchCommsToBackground = makeTypeAssertion(
  batchCommsToBackgroundSchema
);

export const isBatchCommsToDisplayPage = makeTypeAssertion(
  batchCommsToDisplayPageSchema
);
