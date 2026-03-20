import { ConnectionOptions, Queue } from "bullmq";
import { redis } from "./redis";

export const videoQueue = new Queue("video-processing", {
  connection: redis as unknown as ConnectionOptions,
});
