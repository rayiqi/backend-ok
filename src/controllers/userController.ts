import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import cloudinary from "../middleware/cloudinary";
import crypto from "crypto";
import { sendEmail } from "../middleware/sendEmail";
import { compareOtp, hashOtp } from "../middleware/security";

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

export const cekToken = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Anda Harus Login Terlebih dahulu" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    return res
      .status(200)
      .json({ message: "Token masih valid", user: decoded });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Token Telah kadaluwarsa" });
    } else if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ message: "Token tidak valid" });
    } else {
      return res.status(500).json({ message: "Terjadi Kesalahan pada server" });
    }
  }
};

export const getUserLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).user.userId;
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

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(500).json({ message: "User Not Found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await hashOtp(otp);
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // Kedaluwarsa dalam 15 menit

    await prisma.user.update({
      where: { email },
      data: {
        otp: hashedOtp,
        otpExpires,
      },
    });

    await sendEmail(
      email,
      `Reset Password - Kode OTP`,
      `Kode OTP Anda adalah: ${otp}. Berlaku selama 15 menit`
    );
    res.status(200).json({
      message: "Otp Berhasil dikirim , silahkan cek email terlebih dahulu",
      user: {
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi Kesalahan", error });
  }
};

export const verifiyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp || typeof email !== "string") {
      return res.status(400).json({ message: "Input tidak valid" });
    }
    const cekUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!cekUser || !cekUser.otp || !cekUser.otpExpires) {
      return res
        .status(400)
        .json({ message: "Otp tidak ditemukan atau sudah Kedaluwarsa" });
    }
    const otpIsValid = await compareOtp(otp, cekUser.otp);
    if (!otpIsValid || new Date(cekUser.otpExpires) < new Date()) {
      return res.status(400).json({ message: "Otp tidak valid" });
    }
    return res.status(200).json({ message: "Otp Berhasil diverifikasi" });
  } catch (error: any) {
    res.status(400).json({ message: "Terjadi Kesalahan", error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;

  console.log("email", email);
  console.log("new password");

  try {
    if (!email || !newPassword || typeof email !== "string") {
      return res.status(400).json({ message: "Input tidak valid" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.otpExpires) {
      return res.status(400).json({ message: "permintaan tidak valid" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpires: null,
      },
    });
    res.status(200).json({ message: "Password Berhasil Direset" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi Kesalahan", error });
  }
};

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

export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  console.log("user id", userId);
  try {
    const { username } = req.body;
    const cekUser = await prisma.user.findUnique({
      where: {
        userId: Number(userId),
      },
    });
    console.log("cek user", cekUser);

    if (!cekUser) {
      return res.status(404).json({ message: "user tidak ditemukan" });
    }

    let profilePictureUrl = cekUser.profilePictureUrl;
    if (req.file) {
      const file = req.file as Express.Multer.File;
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "user_profile",
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

      profilePictureUrl = (uploadResult as any).secure_url;
    }

    const updatedUser = await prisma.user.update({
      where: { userId: Number(userId) },
      data: {
        username,
        profilePictureUrl,
      },
    });

    return res.status(200).json({
      message: "user berhasil di update",
      updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: "Failed to update user",
      details: error.message,
    });
  }
};

export const verfifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Token not found" });
    }
    const decodedToken = jwt.verify(token, "fregtrhyrtgrsfewr324t5ergfdc");
    return res.status(200).json({ message: "Token verified", decodedToken });
  } catch (error: any) {
    return res.status(500).json({
      message: `Error verifying token: ${error.message}`,
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
