import bcrypt from "bcrypt";

// hash otp
export const hashOtp = async (otp: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

// compare otp
export const compareOtp = async (
  otp: string,
  hashedOtp: any
): Promise<boolean> => {
  return bcrypt.compare(otp, hashedOtp);
};
