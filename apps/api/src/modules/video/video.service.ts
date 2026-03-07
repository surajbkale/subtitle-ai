import { client } from "@repo/database";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
dotenv.config();

export async function createVideoRecord(
  userId: string,
  originalName: string,
  mimeType: string,
  size: number,
) {
  const id = randomUUID();

  const key = `videos/${userId}/${id}-${originalName}`;

  const video = await client.video.create({
    data: {
      id,
      userId,
      originalName,
      mimeType,
      size,
      s3Key: key,
      s3Url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    },
  });

  return video;
}

export async function markVideoUploaded(videoId: string) {
  return client.video.update({
    where: { id: videoId },
    data: { status: "UPLOADED" },
  });
}
