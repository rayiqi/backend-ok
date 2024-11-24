import { Request, Response, Router } from "express";
import {
  createUser,
  getUser,
  getUsers,
  loginUser,
  getUserLogin,
} from "../controllers/userController";
import { authenticateUser } from "../middleware/authentication";

const router = Router();

router.get("/test-auth", authenticateUser);

router.get("/", getUsers);
router.get("/get-user", authenticateUser, getUserLogin);
router.post("/", createUser);
router.post("/login", loginUser);
router.get("/:cognitoId", getUser);

export default router;
