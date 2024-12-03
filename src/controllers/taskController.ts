import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { resolve } from "path";
import cloudinary from "../middleware/cloudinary";
import { error } from "console";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: Number(projectId),
      },
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving tasks: ${error.message}` });
    return;
  }
};


export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    // points,
    // projectId,
    // assignedUserId,
  } = req.body;
  const rawAuthorUserId = (req as any).user.userId;
  const authorUserId =
    typeof rawAuthorUserId === "string"
      ? Number(rawAuthorUserId)
      : rawAuthorUserId;

  const projectId = parseInt(req.body.projectId);
  if (isNaN(projectId)) {
    res.status(400).json({ message: "Project ID must be a number" });
    return;
  }

  const points = parseInt(req.body.points);
  if (isNaN(points)) {
    res.status(400).json({ message: "Points must be a number" });
    return;
  }

  const assignedUserId = req.body.assignedUserId
    ? parseInt(req.body.assignedUserId)
    : null;

  if (assignedUserId !== null && isNaN(assignedUserId)) {
    res.status(400).json({ message: "Assigned User ID must be a number" });
    return;
  }

  if (assignedUserId !== null) {
    const assignedUser = await prisma.user.findUnique({
      where: { userId: assignedUserId },
    });

    if (!assignedUser) {
      res.status(400).json({ message: "Assigned user does not exist" });
      return;
    }
  }

  const files = req.files as Express.Multer.File[]; // get file from request

  try {
    let filesUrl: string[] = [];
    let filesName: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        console.log("file", file);
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          uploadStream.end(file.buffer);
        });
        filesUrl.push((uploadResult as any).secure_url);
        filesName.push(file.originalname);
      }
    }

    console.log("filesUrl", filesUrl);

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        tags,
        startDate,
        dueDate,
        points,
        projectId,
        authorUserId,
        assignedUserId,
        filesUrl,
        filesName,
      },
    });
    res.status(201).json(newTask);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating a task: ${error.message}` });
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        status: status,
      },
    });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};

// get task details

export const getTask = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  try {
    const task = await prisma.task.findUnique({
      where: {
        id: Number(taskId),
      },
    });
    res.json(task);
    // console.log("taskdetails", task);
  } catch (error: any) {
    res.status(500).json({ message: `Error getting task: ${error.message}` });
  }
};

// get task by user login from token , kan ada projectId di task nah tampilkan dia juga atau di relation
export const getTaskUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).user.userId;
  // console.log("user id", userId);
  try {
    const getAllTaskUser = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
        ],
      },
      include: {
        project: true,
      },
    });
    // console.log("getAllTaskUser", getAllTaskUser);
    res.json(getAllTaskUser);
  } catch (error: any) {
    res.status(500).json({ message: `Error getting task: ${error.message}` });
  }
};



// export const updateTask = async (req: Request, res: Response): Promise<void> => {
//   const { taskId } = req.params;
//   const {
//     title,
//     description,
//     status,
//     priority,
//     tags,
//     startDate,
//     dueDate,
//     replaceIndexes,
//   } = req.body;
//   const files = req.files as Express.Multer.File[]; // File baru dari request

//   try {
//     // Ambil data task lama
//     const existingTask = await prisma.task.findUnique({
//       where: { id: Number(taskId) },
//       select: { filesUrl: true, filesName: true },
//     });

//     if (!existingTask) {
//       res.status(404).json({ status: "error", message: "Task not found" });
//       return;
//     }

//     const oldFilesUrl = existingTask.filesUrl || [];
//     const oldFilesName = existingTask.filesName || [];

//     let updatedFilesUrl = [...oldFilesUrl];
//     let updatedFilesName = [...oldFilesName];

//     if (replaceIndexes) {
//       // Validasi replaceIndexes (harus JSON array)
//       const indexes = JSON.parse(replaceIndexes); // replaceIndexes dalam bentuk JSON array

//       console.log("Parsed replaceIndexes:", indexes); // Debug log

//       if (!Array.isArray(indexes) || indexes.some((idx) => isNaN(idx))) {
//         res.status(400).json({
//           status: "error",
//           message: "Invalid replaceIndexes format",
//         });
//         return;
//       }

//       if (indexes.length !== files.length) {
//         res.status(400).json({
//           status: "error",
//           message: "Mismatched file count and replaceIndexes length",
//           details: { replaceIndexes: indexes, fileCount: files.length },
//         });
//         return;
//       }

//       // Iterasi untuk mengganti gambar sesuai indeks
//       for (let i = 0; i < indexes.length; i++) {
//         const indexToReplace = parseInt(indexes[i]);

//         if (
//           isNaN(indexToReplace) ||
//           indexToReplace < 0 ||
//           indexToReplace >= oldFilesUrl.length
//         ) {
//           res.status(400).json({
//             status: "error",
//             message: `Invalid replace index: ${indexToReplace}`,
//           });
//           return;
//         }

//         // Hapus gambar lama di Cloudinary
//         await cloudinary.uploader.destroy(
//           oldFilesUrl[indexToReplace],
//           (error) => {
//             if (error) {
//               throw new Error(
//                 `Failed to delete old file at index ${indexToReplace}: ${error.message}`
//               );
//             }
//           }
//         );

//         // Upload file baru ke Cloudinary
//         const uploadResult = await new Promise((resolve, reject) => {
//           const uploadStream = cloudinary.uploader.upload_stream(
//             { resource_type: "auto" },
//             (error, result) => {
//               if (error) reject(new Error(`Failed to upload file: ${error.message}`));
//               else resolve(result);
//             }
//           );
//           uploadStream.end(files[i].buffer);
//         });

//         // Ganti file lama dengan file baru
//         updatedFilesUrl[indexToReplace] = (uploadResult as any).secure_url;
//         updatedFilesName[indexToReplace] = files[i].originalname;
//       }
//     }

//     // Update task di database
//     const updatedTask = await prisma.task.update({
//       where: { id: Number(taskId) },
//       data: {
//         title,
//         description,
//         status,
//         priority,
//         tags,
//         startDate,
//         dueDate,
//         filesUrl: updatedFilesUrl,
//         filesName: updatedFilesName,
//       },
//     });

//     res.status(200).json({
//       status: "success",
//       message: "Task updated successfully",
//       data: updatedTask,
//     });
//   } catch (error: any) {
//     console.error("Error in updateTask:", error); // Debug log
//     res.status(500).json({
//       status: "error",
//       message: "Failed to update task",
//       details: error.message,
//     });
//   }
// };

export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    replaceIndex,
    deleteIndex,
  } = req.body;

  const files = req.files as Express.Multer.File[];

  try {
    // Ambil task lama dari database
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(taskId) },
      select: { filesName: true, filesUrl: true },
    });

    if (!existingTask) {
      res.status(404).json({ status: "error", message: "Task not found" });
      return;
    }

    const oldFilesName = existingTask.filesName || [];
    const oldFilesUrl = existingTask.filesUrl || [];

    let updatedFilesName = [...oldFilesName];
    let updatedFilesUrl = [...oldFilesUrl];

    if (replaceIndex) {
      // Tangani replaceIndexes
      const replaceIndexesRaw = replaceIndex;
      const replaceIndexes = Array.isArray(replaceIndexesRaw)
        ? replaceIndexesRaw.map((idx) => Number(idx))
        : [Number(replaceIndexesRaw)];
      console.log("replaceIndexes", replaceIndexes);
      if (replaceIndexes.some((idx) => isNaN(idx))) {
        res.status(400).json({
          status: "error",
          message: "replaceIndexes harus berupa angka atau array angka",
        });
        return;
      }

      if (replaceIndexes.length !== files.length) {
        res.status(400).json({
          status: "error",
          message: "Jumlah file dan replaceIndexes tidak sama",
          details: { replaceIndexes, fileCount: files.length },
        });
        return;
      }

      // Ganti file lama dengan file baru di indeks yang sesuai
      for (let i = 0; i < replaceIndexes.length; i++) {
        const index = replaceIndexes[i];
        if (index < 0 || index >= oldFilesUrl.length) {
          res.status(400).json({
            status: "error",
            message: `Invalid replace index: ${index}`,
          });
          return;
        }

        // Hapus file lama di Cloudinary
        await cloudinary.uploader.destroy(oldFilesUrl[index], (error) => {
          if (error) {
            throw new Error(
              `Failed to delete old file at index ${index}: ${error.message}`
            );
          }
        });

        // Upload file baru ke Cloudinary
        const uploadedFile = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(files[i].buffer);
        });

        updatedFilesUrl[index] = (uploadedFile as any).secure_url;
        updatedFilesName[index] = files[i].originalname;
      }
    }

    if (deleteIndex) {
      const deleteIndexesRaw = deleteIndex;
      const deleteIndexes = Array.isArray(deleteIndexesRaw)
        ? deleteIndexesRaw.map((idx) => Number(idx))
        : [Number(deleteIndexesRaw)];

      if (deleteIndexes.some((idx) => isNaN(idx))) {
        res.status(400).json({
          status: "error",
          message: "deleteIndexes harus berupa angka atau array angka",
        });
        return;
      }

      // Hapus file berdasarkan deleteIndexes
      for (const index of deleteIndexes.sort((a, b) => b - a)) {
        if (index < 0 || index >= updatedFilesUrl.length) {
          res.status(400).json({
            status: "error",
            message: `Invalid delete index: ${index}`,
          });
          return;
        }

        // Hapus file di Cloudinary
        await cloudinary.uploader.destroy(updatedFilesUrl[index], (error) => {
          if (error) {
            throw new Error(
              `Failed to delete file at index ${index}: ${error.message}`
            );
          }
        });

        // Hapus dari array file
        updatedFilesName.splice(index, 1);
        updatedFilesUrl.splice(index, 1);

        console.log("hapus gambar", deleteIndexes);
      }
    }

    // Update task di database
    const updatedTask = await prisma.task.update({
      where: { id: Number(taskId) },
      data: {
        title,
        description,
        status,
        priority,
        tags,
        startDate,
        dueDate,
        filesUrl: updatedFilesUrl,
        filesName: updatedFilesName,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error: any) {
    console.error("Error updating task:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update task",
      details: error.message,
    });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  console.log("task id", taskId);
  try {
    const taskDeleted = await prisma.task.delete({
      where: {
        id: Number(taskId),
      },
    });
    res.json({ message: "Task deleted", taskDeleted });
  } catch (error: any) {
    res.status(500).json({ message: `Error deleting task: ${error.message}` });
  }
};

export const getUserTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
        ],
      },
      include: {
        author: true,
        assignee: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user's tasks: ${error.message}` });
  }
};
