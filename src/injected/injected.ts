import { ConsoleCapture } from "../common/messages";

const originals = { ...console };

function JSONBatch(v: unknown): unknown {
  if (
    !v ||
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean"
  ) {
    return v;
  }

  if (Array.isArray(v)) {
    return v.map(JSONBatch);
  }

  if (v instanceof AbortSignal) {
    return {
      __serialized_type: 'AbortSignal',
      a: v.aborted,
      b: v.reason
    }
  }

  // TODO: Need to serialize like, everything possible haha
  return v;
}

class Logfunnel {
  private _batch: ConsoleCapture[] = [];
  private _timer: number | null = null;
  private _commsid: string;
  private _commsel: HTMLElement = document.createElement("input");

  constructor() {
    this._commsid = Math.floor(Math.random() * 100000000).toString();
    window.addEventListener("DOMContentLoaded", () => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.id = `tabflumecomms_${this._commsid}`;
      this._commsel = input;
      document.body.prepend(input);
      document.dispatchEvent(
        new CustomEvent("inittabflume", { detail: this._commsid })
      );

      this._commsel.remove();
    });
  }

  insert = (capture: ConsoleCapture) => {
    this._batch.push(capture);
    if (!this._timer) {
      this._timer = window.setTimeout(() => this.sendBatch(), 50);
    }
  };

  private sendBatch() {
    if (this._batch.length === 0) {
      if (this._timer) {
        window.clearTimeout(this._timer);
        this._timer = null;
      }
      return;
    }

    this._commsel.dispatchEvent(
      new CustomEvent("batchcomms", {
        detail: JSONBatch(this._batch),
      })
    );

    this._batch = [];
    this._timer = window.setTimeout(() => this.sendBatch(), 50);
  }
}

const funnel = new Logfunnel();

function makeProxy(fn: typeof console.log, type: ConsoleCapture["type"]) {
  return new Proxy(fn, {
    apply: (a, b, c) => {
      funnel.insert({ type, arguments: c, time: performance.now() });
      return Reflect.apply(a, b, c);
    },
  });
}

console.log = makeProxy(console.log, "log");
console.warn = makeProxy(console.warn, "warn");
console.error = makeProxy(console.error, "error");
console.info = makeProxy(console.info, "info");
console.debug = makeProxy(console.debug, "debug");
