import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { createUploadUrl, completeUpload } from "./video.controller";

const router: Router = Router();

router.post("/upload-url", authMiddleware, asyncHandler(createUploadUrl));

router.post("/:id/complete", authMiddleware, asyncHandler(completeUpload));

export default router;
