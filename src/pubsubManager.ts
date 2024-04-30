import { RedisClientType, createClient } from "redis";

export class PubSubManager {
  private static instance: PubSubManager;
  private redisClient: RedisClientType;
  private subscriptions: Map<string, string[]>;
  private constructor() {
    this.redisClient = createClient();
    this.redisClient.connect();
    this.subscriptions = new Map();
  }

  public static getInstance() {
    if (PubSubManager.instance) return PubSubManager.instance;
    return new PubSubManager();
  }

  addUserToStock(userId: string, stockTicker: string) {
    if (!this.subscriptions.has(stockTicker)) {
      this.subscriptions.set(stockTicker, []);
    }

    this.subscriptions.get(stockTicker)?.push(userId);

    if (this.subscriptions.get(stockTicker)?.length === 1) {
      this.redisClient.subscribe(stockTicker, (message) => {
        this.forwardMessageToUser(userId, stockTicker, message);
      });
      console.log(`Subscribed to Redis Channel : ${stockTicker}`);
    }
  }

  removeUserFromStock(userId: string, stockTicker: string) {
    this.subscriptions.set(
      stockTicker,
      this.subscriptions.get(stockTicker)?.filter((sub) => sub !== userId) || []
    );

    if (this.subscriptions.get(stockTicker)?.length === 0) {
      this.redisClient.unsubscribe(stockTicker);
      console.log(`Unsubscribed to Redis channel: ${stockTicker}`);
    }
  }

  private forwardMessageToUser(
    userId: string,
    stockTicker: string,
    price: string
  ) {
    console.log(`Message received on channel ${stockTicker}: ${price}`);
    this.subscriptions.get(stockTicker)?.forEach((sub) => {
      console.log(`Sending message to user: ${sub}`);
    });
  }

  public async disconnect() {
    await this.redisClient.quit();
  }
}
