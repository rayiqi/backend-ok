import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProjects,
  getProjectsByAuthorUserId,
  updateProject,
} from "../controllers/projectController";
import { authenticateUser } from "../middleware/authentication";

const router = Router();
router.get("/", getProjects);
router.get("/my-projects", authenticateUser, getProjectsByAuthorUserId);
router.post("/", authenticateUser, createProject);
router.put("/:id", authenticateUser, updateProject);
router.delete("/:id", authenticateUser, deleteProject);

export default router;
