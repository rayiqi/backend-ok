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

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Mendapatkan semua proyek
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar proyek
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   author:
 *                     type: string
 */

router.get("/", getProjects);
router.get("/my-projects", authenticateUser, getProjectsByAuthorUserId);
router.post("/", authenticateUser, createProject);
router.put("/:id", authenticateUser, updateProject);
router.delete("/:id", authenticateUser, deleteProject);

export default router;
