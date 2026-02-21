import { Router } from "express";
import { login, logout, refresh, register } from "./auth.controller";
import { asyncHandler } from "../../utils/asyncHandler";
const router: Router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));

export default router;
