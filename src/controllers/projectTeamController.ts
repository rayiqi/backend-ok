import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all project team by user login
export const getProjectTeams = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authorUserId = (req as any).user.userId;
  try {
    const projectTeams = await prisma.projectTeam.findMany({
      where: {
        userId: authorUserId,
      },
    });
    // ambil data project berdasarkan projectId
    const projects = await prisma.project.findMany({
      where: {
        id: {
          in: projectTeams.map((team) => team.projectId),
        },
      },
    });
    res.json(projects);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving project teams: ${error.message}` });
  }
};
