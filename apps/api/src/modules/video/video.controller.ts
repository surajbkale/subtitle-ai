import { Request, Response } from "express";
import { createVideoRecord, markVideoUploaded } from "./video.service";
import { generateUploadUrl } from "./video.upload";
import { BadRequestError } from "../../errors/HttpErrors";
import { VideoQueue } from "../../queues/video.queue";

export async function createUploadUrl(req: Request, res: Response) {
  const user = (req as any).user;

  const { originalName, mimeType, size } = req.body;

  if (!originalName || !mimeType || !size) {
    throw new BadRequestError("Missing video matadata");
  }

  const video = await createVideoRecord(
    user.userId,
    originalName,
    mimeType,
    size,
  );

  const uploadUrl = await generateUploadUrl(video.s3Key, mimeType);

  return res.json({
    videoId: video.id,
    uploadUrl,
    s3Key: video.s3Key,
  });
}

export async function completeUpload(req: Request, res: Response) {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new BadRequestError("Missing video id");
  }

  const video = await markVideoUploaded(id);

  await VideoQueue.add("process-video", {
    videoId: video.id,
  });

  return res.json({
    success: true,
    video,
  });
}
