import { PubSubManager } from "./pubsubManager";

setInterval(() => {
  PubSubManager.getInstance().addUserToStock(Math.random().toString(), "APPL");
}, 5000);
