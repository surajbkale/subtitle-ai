import { ConnectionOptions, Queue } from "bullmq";
import { redis } from "../utils/redis";

export const VideoQueue = new Queue("video-processing", {
  connection: redis as unknown as ConnectionOptions,
});
