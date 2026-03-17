import { ConnectionOptions, Worker } from "bullmq";
import { redis } from "../utils/redis";

export const videoWorker = new Worker(
  "video-processing",
  async (job) => {
    const { videoId } = job.data;

    console.log("Processing video: ", videoId);

    // download video
    // extract audio
    // upload audio
  },
  {
    connection: redis as unknown as ConnectionOptions,
  },
);
