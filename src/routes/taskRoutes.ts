import { Router } from "express";
import {
  createTask,
  getTasks,
  getUserTasks,
  updateTask,
  updateTaskStatus,
} from "../controllers/taskController";
import { authenticateUser } from "../middleware/authentication";

const router = Router();

router.get("/", getTasks);
router.post("/", authenticateUser ,createTask);
router.put("/:taskId", updateTask);
router.patch("/:taskId/status", updateTaskStatus);
router.get("/user/:userId", getUserTasks);

export default router;
