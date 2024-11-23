import { NextFunction, Request, RequestHandler, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import { verifyToken } from "../utils/jwtUtil";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const user: RequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];

  console.log(token);

  if (!token) {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  try {
    const payload = verifyToken(token) as JwtPayload;

    console.log(payload);
    req.user = payload;
    next();
  } catch (error) {
    res.status(403).json({ error: "Unauthorized" });
  }
};