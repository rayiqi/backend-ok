import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = "y123214rgfvefadsin";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving users: ${error.message}` });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { userId: Number(userId) },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user: ${error.message}` });
  }
};

// export const postUser = async (req: Request, res: Response) => {
//   try {
//     const {
//       username,
//       email,
//       cognitoId,
//       profilePictureUrl = "i1.jpg",
//       teamId = 1,
//     } = req.body;
//     const newUser = await prisma.user.create({
//       data: {
//         username,
//         email,
//         cognitoId,
//         profilePictureUrl,
//         teamId,
//       },
//     });
//     res.json({ message: "User Created Successfully", newUser });
//   } catch (error: any) {
//     res
//       .status(500)
//       .json({ message: `Error retrieving users: ${error.message}` });
//   }
// };

// Fungsi untuk membuat hash password
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

// Fungsi untuk membuat token JWT
const generateToken = (
  userId: any,
  username: string,
  email: string
): string => {
  const token = jwt.sign({ userId, username, email }, SECRET_KEY, {
    expiresIn: "5h",
  });
  // console.log("Generated Token:", token);
  return token;
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      password,
      profilePictureUrl = "i1.jpg",
      teamId,
    } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ message: "Please fill all required fields" });
    }
    const hashedPassword = await hashPassword(password);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        profilePictureUrl,
        teamId,
        password: hashedPassword,
      },
    });
    const token = generateToken(newUser.userId, username, email);
    return res.status(201).json({
      message: "User berhasil dibuat",
      user: {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        profilePictureUrl: newUser.profilePictureUrl,
        teamId: newUser.teamId,
      },
      token,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Error creating user: ${error.message}`,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Please fill all required fields" });
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Password salah" });
    }
    const token = generateToken(user.userId, user.username, user.email);
    return res.status(200).json({
      message: "Login berhasil",
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl,
        teamId: user.teamId,
      },
      token,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Error logging in: ${error.message}`,
    });
  }
};
