import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  getTaskUser,
  getUserTasks,
  updateTask,
  updateTaskStatus,
} from "../controllers/taskController";
import { authenticateUser } from "../middleware/authentication";
import upload from "../middleware/multer";

const router = Router();

router.get("/", getTasks);
router.post("/", authenticateUser, upload.array("file"), createTask);
router.get("/my-tasks", authenticateUser, getTaskUser);
router.get("/:taskId", getTask);
router.put("/:taskId", upload.array("file"), updateTask);
router.delete("/:taskId", deleteTask);
router.patch("/:taskId/status", updateTaskStatus);
router.get("/user/:userId", getUserTasks);

export default router;
