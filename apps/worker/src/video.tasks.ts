import dotenv from "dotenv";
dotenv.config();
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { pipeline } from "stream/promises";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { client } from "@repo/database";
import { Readable } from "stream";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function extractAudio(videoId: string) {
  console.log("Processing video:", videoId);
  const video = await client.video.findUnique({
    where: { id: videoId },
  });

  console.log("Video metadata loaded");

  console.log("Downloading video from S3...");
  if (!video) throw new Error("Video not found");

  const tempVideo = `/tmp/${videoId}.mp4`;
  const tempAudio = `/tmp/${videoId}.mp3`;

  // Update status
  try {
    await client.video.update({
      where: { id: videoId },
      data: { status: "PROCESSING_AUDIO" },
    });

    // Download video from S3
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: video.s3Key,
    });

    const response = await s3.send(command);

    if (!response.Body) {
      throw new Error("S3 response body missing");
    }

    console.log("Streaming video to temp file...");

    const stream = Readable.from(response.Body as any);

    await pipeline(stream, fs.createWriteStream(tempVideo));

    console.log("Video download completed");

    console.log("Starting FFmpeg extraction...");
    // Extract audio with FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(tempVideo)
        .noVideo()
        .audioCodec("libmp3lame")
        .save(tempAudio)
        .on("end", resolve)
        .on("error", reject);
    });

    // Upload audio to S3
    const audioKey = `audio/${videoId}.mp3`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: audioKey,
        Body: fs.createReadStream(tempAudio),
        ContentType: "audio/mpeg",
      }),
    );

    // Update database
    await client.video.update({
      where: { id: videoId },
      data: {
        audioKey,
        status: "SUBTITLES_READY",
      },
    });

    console.log("Audio extraction completed:", videoId);
  } finally {
    const filesToDelete = [tempVideo, tempAudio];
    await Promise.all(
      filesToDelete.map(async (file) => {
        try {
          await fs.promises.unlink(file);
        } catch (error: any) {
          if (error?.code !== "ENOENT") {
            console.error(`Failed to delete temp file ${file}: ${error}`);
          }
        }
      }),
    );
  }
}
