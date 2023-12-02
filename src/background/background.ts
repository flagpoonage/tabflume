import { extension } from "../common/extension";
import { asFailable } from "@flagpoonage/tools";
import {
  createBatchCommsToDisplayPage,
  isBatchCommsToBackground,
} from "../common/messages";

console.log("Hello from background");

extension.runtime.onMessage.addListener((message: unknown, sender, respond) => {
  asFailable(() => handleMessage(message, sender)).then(respond);
  return true;
});

async function handleMessage(
  message: unknown,
  sender: chrome.runtime.MessageSender
) {
  const sender_tab_id = sender.tab?.id;

  if (!sender_tab_id) {
    return console.warn("Received message from unknown sender");
  }

  const sender_tab_result = await asFailable(() =>
    extension.tabs.get(sender_tab_id)
  );

  if (!sender_tab_result.success) {
    return console.error("Unable to query sender tab", sender_tab_result.error);
  }

  const sender_tab = sender_tab_result.value;

  if (!sender_tab) {
    return console.error("Unable to find sender tab", sender_tab_id);
  }

  const display_tabs_result = await asFailable(() =>
    extension.tabs.query({
      url: extension.runtime.getURL("main.html"),
    })
  );

  if (!display_tabs_result.success) {
    return console.error("Unable to query for tabs", display_tabs_result.error);
  }

  if (!isBatchCommsToBackground(message)) {
    return console.warn("Unknown message recieved");
  }

  const send_results = await Promise.all(
    display_tabs_result.value.map((tab) => {
      const tab_id = tab.id;
      if (!tab_id) {
        return;
      }

      const page_message = createBatchCommsToDisplayPage(message.logs, {
        id: sender_tab_id,
        url: sender_tab.url ?? "",
      });

      return asFailable(() => extension.tabs.sendMessage(tab_id, page_message));
    })
  );

  send_results.forEach((v) => {
    if (!v || v.success) {
      return;
    }

    console.error("Unable to send to display page", v.error);
  });
}
