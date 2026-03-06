import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../utils/s3";
import { client } from "@repo/database";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
dotenv.config();

export async function uploadVideo(userId: string, file: Express.Multer.File) {
  const key = `videos/${userId}/${randomUUID()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  const video = await client.video.create({
    data: {
      userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      s3Key: key,
      s3Url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    },
  });

  return video;
}
