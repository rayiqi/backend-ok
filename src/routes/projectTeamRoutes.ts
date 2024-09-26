import { Router } from "express";

import { getProjectTeams } from "../controllers/projectTeamController";
import { authenticateUser } from "../middleware/authentication";

const router = Router();

router.get("/", authenticateUser, getProjectTeams);

export default router;
