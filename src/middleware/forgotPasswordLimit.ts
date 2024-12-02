import rateLimit from "express-rate-limit";

export const forgotPasswordLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Terlalu banyak permintaan coba lagi",
});
