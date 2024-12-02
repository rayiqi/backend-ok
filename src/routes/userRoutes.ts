import { Request, Response, Router } from "express";
import {
  createUser,
  getUser,
  getUsers,
  loginUser,
  getUserLogin,
  updateUser,
  forgotPassword,
  resetPassword,
  verifiyOtp,
  cekToken,
} from "../controllers/userController";
import { authenticateUser } from "../middleware/authentication";
import upload from "../middleware/multer";
import { forgotPasswordLimit } from "../middleware/forgotPasswordLimit";

const router = Router();

router.get("/test-auth", authenticateUser);
router.get("/cek-token", cekToken);
router.get("/", getUsers);
router.get("/get-user", authenticateUser, getUserLogin);
router.post("/", createUser);
router.put("/:userId", upload.single("file"), updateUser);
router.post("/login", loginUser);
router.get("/:cognitoId", getUser);
router.post("/forgot-password", forgotPasswordLimit, forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifiyOtp);

export default router;
