import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProjectByProjectId,
  getProjects,
  getProjectsByAuthorUserId,
  updateProject,
} from "../controllers/projectController";
import { authenticateUser } from "../middleware/authentication";
import multer from "multer";

const router = Router();

// Konfigurasi Multer untuk penyimpanan di memori
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rute Proyek
router.get("/", getProjects);
router.get("/my-projects", authenticateUser, getProjectsByAuthorUserId);
router.get("/:projectId", getProjectByProjectId);
router.post("/", authenticateUser, createProject);
// router.post("/", authenticateUser, upload.single("file"), createProject);
router.put("/:id", authenticateUser, updateProject);
router.delete("/:id", authenticateUser, deleteProject);

export default router;
