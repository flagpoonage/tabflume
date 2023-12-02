import { extension } from "../../common/extension";
import {
  BatchCommsToDisplayPageSchema,
  isBatchCommsToDisplayPage,
} from "../../common/messages";

interface CollectedLog {
  tab_id: number;
  args: unknown[];
  time: number;
  element: HTMLElement;
}

const state = {
  logs: [] as CollectedLog[],
  tabs: new Map<number, { id: number; url: string }>(),
  ready: document.readyState !== "loading",
};

extension.runtime.onMessage.addListener((message: unknown) => {
  if (!isBatchCommsToDisplayPage(message)) {
    return;
  }

  const current_tab = state.tabs.get(message.tab.id);

  if (!current_tab) {
    state.tabs.set(message.tab.id, message.tab);

    state.logs = state.logs.concat(
      message.logs.map((a) => ({
        tab_id: message.tab.id,
        args: a.arguments,
        time: a.time,
        element: createElementOf(a, message.tab),
      }))
    );

    update();
  }

  console.log("Page received batch comms", message);
});

function update () {
  
}

function createElementOf(
  message: BatchCommsToDisplayPageSchema["logs"][number],
  tabData: BatchCommsToDisplayPageSchema["tab"]
) {
  const div = document.createElement("div");
  const type = document.createElement("div");
  const time = document.createElement("div");
  const tab = document.createElement("div");
  const url = document.createElement("div");
  const args = document.createElement("div");

  const argchilds = message.arguments.forEach((v) => {
    const el = document.createElement("div");
    el.innerHTML = JSON.stringify(v);
    args.appendChild(el);
  });

  url.innerHTML = tabData.url;
  tab.innerHTML = tabData.id.toString();
  time.innerHTML = message.time.toString();
  type.innerHTML = message.type;

  div.appendChild(type);
  div.appendChild(time);
  div.appendChild(tab);
  div.appendChild(url);
  div.appendChild(args);

  return div;
}

function onReady() {
  state.ready = true;
}

document.readyState !== "loading"
  ? onReady()
  : document.addEventListener("DOMContentLoaded", onReady);
