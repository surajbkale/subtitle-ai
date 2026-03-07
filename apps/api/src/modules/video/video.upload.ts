import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../utils/s3";
import dotenv from "dotenv";
dotenv.config();

export async function generateUploadUrl(key: string, mimeType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: mimeType,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 600,
  });

  return url;
}
