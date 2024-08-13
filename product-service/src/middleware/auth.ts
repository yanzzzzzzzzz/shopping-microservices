import { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyToken } from "../utils/jwt";

export interface UserRequest extends Request {
  user?: {
    id: number;
  };
}

export const authMiddleware: RequestHandler = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = { id: decoded.id };
  next();
};
