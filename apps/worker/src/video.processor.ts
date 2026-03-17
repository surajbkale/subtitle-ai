import { ConnectionOptions, Worker } from "bullmq";
import { redis } from "@repo/utils/redis";
import { extractAudio } from "./video.tasks";

export const videoWorker = new Worker(
  "video-processing",
  async (job) => {
    try {
      const { videoId } = job.data;

      console.log("Processing video:", videoId);

      await extractAudio(videoId);

      console.log("Job completed:", videoId);
    } catch (err) {
      console.error("Worker error:", err);
    }
  },
  { connection: redis as unknown as ConnectionOptions },
);

videoWorker.on("failed", (job, err) => {
  console.error("Job failed:", job?.id, err);
});

videoWorker.on("completed", (job) => {
  console.log("Job finished:", job.id);
});
