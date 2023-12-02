import { extension } from "../common/extension";

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

  comms_el.addEventListener("batchcomms", (ev: Event) => {
    if (!(ev instanceof CustomEvent)) {
      return;
    }

    console.log("Got batch event through comms", ev.detail);
  });
});
