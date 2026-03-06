import { Request, Response } from "express";
import { uploadVideo } from "./video.service";
import { BadRequestError } from "../../errors/HttpErrors";

export async function uploadVideoController(req: Request, res: Response) {
  const file = req.file;

  if (!file) {
    throw new BadRequestError("Video file is required");
  }

  const user = (req as any).user;

  const video = await uploadVideo(user.userId, file);

  return res.json({
    success: true,
    video,
  });
}
