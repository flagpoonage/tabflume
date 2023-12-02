import { extension } from "../../common/extension";
import { isBatchCommsToDisplayPage } from "../../common/messages";

extension.runtime.onMessage.addListener((message: unknown) => {
  if (!isBatchCommsToDisplayPage(message)) {
    return;
  }

  console.log("Page received batch comms", message);
});
