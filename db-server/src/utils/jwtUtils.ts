import jwt, { JwtPayload } from "jsonwebtoken";

export function generateToken(input: any) {
  try {
    const token = jwt.sign(input, process.env.JWT || "pravin");
    return token;
  } catch (error) {
    throw new Error("error while generating token");
  }
}

export function verifyToken(token: any): JwtPayload {
  try {
    const verify = jwt.verify(token, process.env.JWT || "pravin") as JwtPayload;
    return verify;
  } catch (error) {
    throw new Error("error while generating token");
  }
}