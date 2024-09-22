import { Router } from "express";
import { createProject, getProjects } from "../controllers/projectController";
import { authenticateUser } from "../middleware/authentication";

const router = Router();

router.get("/", getProjects);
router.post("/", authenticateUser, createProject);

export default router;
