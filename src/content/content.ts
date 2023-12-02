import { extension } from "../common/extension";
import { createBatchCommsToBackground } from "../common/messages";

const script = document.createElement("script");
script.src = extension.runtime.getURL("injected.js");

document.documentElement.appendChild(script);

const state = {
  ready: false,
  el: document.createElement("input") as HTMLElement,
};

document.addEventListener("inittabflume", (ev) => {
  if (!(ev instanceof CustomEvent)) {
    return;
  }

  const id = ev.detail;

  if (typeof id !== "string") {
    return;
  }

  const comms_el = document.querySelector(`#tabflumecomms_${id}`);

  if (!(comms_el instanceof HTMLElement)) {
    return;
  }

  state.ready = true;
  state.el = comms_el;

  comms_el.addEventListener("batchcomms", async (ev: Event) => {
    if (!(ev instanceof CustomEvent) || !Array.isArray(ev.detail)) {
      return;
    }

    try {
      await extension.runtime.sendMessage(
        createBatchCommsToBackground(ev.detail)
      );
    } catch (exception) {
      console.warn("Failed to send comms batch to background", exception);
    }
  });
});
