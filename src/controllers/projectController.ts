import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const projects = await prisma.project.findMany();
    res.json(projects);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving projects: ${error.message}` });
  }
};

//  get all Project By AuthorUserId
export const getProjectsByAuthorUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authorUserId = (req as any).user.userId;
  try {
    const projects = await prisma.project.findMany({
      where: {
        authorUserId,
      },
    });
    res.json(projects);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving projects: ${error.message}` });
  }
};

export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description, startDate, endDate, teamMemberIds } = req.body;
  const authorUserId = (req as any).user.userId;

  try {
    // Membuat project baru
    const newProject = await prisma.project.create({
      data: {
        name,
        authorUserId,
        description,
        startDate,
        endDate,
      },
    });

    // Membuat entri untuk teamProject (anggota tim)
    if (teamMemberIds && teamMemberIds.length > 0) {
      const teamProjectsData = teamMemberIds.map((userId: number) => ({
        userId,
        projectId: newProject.id,
      }));

      await prisma.projectTeam.createMany({
        data: teamProjectsData,
      });
    }

    // Mengambil data team members setelah createMany
    const teamMembers = await prisma.projectTeam.findMany({
      where: {
        projectId: newProject.id,
      },
    });

    // Sertakan teamMemberIds di dalam respons
    res.status(201).json({
      ...newProject,
      teamMemberIds: teamMembers.map((team) => team.userId),
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating a project: ${error.message}` });
  }
};

// Update project

export const updateProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, description, startDate, endDate, teamMemberIds } = req.body;

  try {
    // Update project
    const project = await prisma.project.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        description,
        startDate,
        endDate,
      },
    });

    // Update projectTeam (anggota tim)
    if (teamMemberIds && teamMemberIds.length > 0) {
      // Hapus semua anggota tim terkait project ini
      await prisma.projectTeam.deleteMany({
        where: {
          projectId: parseInt(id),
        },
      });

      // Tambahkan anggota tim baru
      const teamProjectsData = teamMemberIds.map((userId: number) => ({
        userId,
        projectId: parseInt(id),
      }));

      await prisma.projectTeam.createMany({
        data: teamProjectsData,
      });
    }

    // Ambil data team members setelah update
    const teamMembers = await prisma.projectTeam.findMany({
      where: {
        projectId: parseInt(id),
      },
    });

    // Sertakan teamMemberIds di respons
    res.json({
      ...project,
      teamMemberIds: teamMembers.map((team) => team.userId),
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating a project: ${error.message}` });
  }
};

// Delete project

export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    // Hapus semua anggota tim terkait project ini
    await prisma.projectTeam.deleteMany({
      where: {
        projectId: parseInt(id),
      },
    });
    // Hapus project
    await prisma.project.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.json({ message: "Project deleted" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error deleting a project: ${error.message}` });
  }
};
