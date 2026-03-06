import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { uploadVideoController } from "./video.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router: Router = Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("video"),
  asyncHandler(uploadVideoController),
);

export default router;
