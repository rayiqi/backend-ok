// import { Request, Response } from "express";
// import jwt from "jsonwebtoken";

// export const authenticateUser = (
//   req: Request,
//   res: Response,
//   next: Function
// ): Response | void => {
//   const authHeader = req.headers.authorization;
//   const SECRET_KEY = "y123214rgfvefadsin";

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res
//       .status(401)
//       .json({ message: "Anda harus login terlebih dahulu." });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, SECRET_KEY) as any;
//     (req as any).user = decoded;

//     // const user = (req as any).user;
//     // res.status(200).json({ message: "Autentikasi berhasil", user });
//     next();
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return res
//       .status(401)
//       .json({ message: "Token tidak valid atau telah kadaluwarsa." });
//   }
// };

import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const authHeader = req.headers.authorization;
  const SECRET_KEY = "y123214rgfvefadsin";

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Anda harus login terlebih dahulu." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Token telah kadaluwarsa." });
    } else if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ message: "Token tidak valid." });
    } else {
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan pada server." });
    }
  }
};
